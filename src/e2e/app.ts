import { waitFor } from "@testing-library/dom";
import * as fs from "fs";
import * as fsp from "fs/promises";
import * as os from "os";
import * as path from "path";
import "pptr-testing-library/extend";
import puppeteer, { Page } from "puppeteer";

export interface BrowserDownload {
  filename: string;
  data: Buffer;
}

/**
 * Model of the app to drive it for e2e testing.
 *
 * We could split this into screen areas accessible from this class.
 *
 * All methods should ensure they wait for a condition rather than relying on timing.
 *
 * Generally this means it's better to pass in expected values, so you can wait for
 * them to be true, than to read and return data from the DOM.
 */
export class App {
  private page: Promise<Page>;
  private downloadPath = fs.mkdtempSync(
    path.join(os.tmpdir(), "puppeteer-downloads-")
  );

  constructor() {
    this.page = (async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      const client = await page.target().createCDPSession();
      await client.send("Page.setDownloadBehavior", {
        behavior: "allow",
        downloadPath: this.downloadPath,
      });
      return page;
    })();
  }

  /**
   * Open a file using the file chooser.
   *
   * @param filePath The file on disk.
   */
  async open(filePath: string): Promise<void> {
    await this.selectSideBar("Files");
    const document = await this.document();
    const openInput = await document.getByTestId("open-input");
    await openInput.uploadFile(filePath);
  }

  /**
   * Open a file using drag and drop.
   *
   * This is a bit fragile and likely to break if we change the DnD DOM as
   * we resort to simulating DnD events.
   *
   * @param filePath The file on disk.
   */
  async dropFile(filePath: string): Promise<void> {
    const page = await this.page;
    // Puppeteer doesn't have file drio support but we can use an input
    // to grab a file and trigger an event that's good enough.
    // It's a bit of a pain as the drop happens on an element created by
    // the drag-over.
    // https://github.com/puppeteer/puppeteer/issues/1376
    const inputId = "simulated-drop-input";
    await page.evaluate((inputId) => {
      const input = document.createElement("input");
      input.style.display = "none";
      input.type = "file";
      input.id = inputId;
      input.onchange = (e: any) => {
        const dragOverZone = document.querySelector(
          "[data-testid=project-drop-target]"
        );
        if (!dragOverZone) {
          throw new Error();
        }
        const dragOverEvent = new Event("dragover", {
          bubbles: true,
        });
        const dropEvent = new Event("drop", {
          bubbles: true,
        });
        (dragOverEvent as any).dataTransfer = { types: ["Files"] };
        (dropEvent as any).dataTransfer = { files: e.target.files };
        dragOverZone.dispatchEvent(dragOverEvent);

        const dropZone = document.querySelector(
          "[data-testid=project-drop-target-overlay]"
        );
        dropZone!.dispatchEvent(dropEvent);

        input.remove();
      };
      document.body.appendChild(input);
    }, inputId);
    const fileInput = await page.$(`#${inputId}`);
    return fileInput!.uploadFile(filePath);
  }

  /**
   * Use the Files sidebar to change the current file we're editing.
   *
   * @param filename The name of the file in the file list.
   */
  async switchToEditing(filename: string): Promise<void> {
    await this.selectSideBar("Files");
    const document = await this.document();
    const editButton = await document.findByRole("button", {
      name: "Edit " + filename,
    });
    await editButton.click();
  }

  /**
   * Wait for an alert, throwing if it doesn't happen.
   *
   * @param title The expected alert title.
   * @param description The expected alert description (if any).
   */
  async alertText(title: string, description?: string): Promise<void> {
    const document = await this.document();
    await document.findByText(title);
    if (description) {
      await document.findByText(description);
    }
    await document.findAllByRole("alert");
  }

  /**
   * Wait for the editor contents to match the given regexp, throwing if it doesn't happen.
   *
   * Only the first few lines will be visible.
   *
   * @param match The regex.
   */
  async findVisibleEditorContents(match: RegExp): Promise<void> {
    const document = await this.document();
    const text = () =>
      document.evaluate(() => {
        const lines = Array.from(window.document.querySelectorAll(".cm-line"));
        return lines.map((l) => (l as HTMLElement).innerText).join("\n");
      });
    return waitFor(async () => {
      const value = await text();
      expect(value).toMatch(match);
    });
  }

  /**
   * Edit the project name.
   *
   * @param projectName The new name.
   */
  async setProjectName(projectName: string): Promise<void> {
    const document = await this.document();
    const editButton = await document.getByRole("button", {
      name: "Edit project name",
    });
    await editButton.click();
    const input = await document.findByTestId("project-name-input");
    await input.type(projectName);
    await input.press("Enter");
  }

  /**
   * Wait for the project name
   *
   * @param match
   * @returns
   */
  async findProjectName(match: string): Promise<void> {
    const text = async () => {
      const document = await this.document();
      const projectName = await document.getByTestId("project-name");
      return projectName.getNodeText();
    };
    return waitFor(async () => {
      const value = await text();
      expect(value).toEqual(match);
    });
  }

  /**
   * Trigger a download but don't wait for it to complete.
   *
   * Useful when the action is expected to fail.
   * Otherwise see waitForDownload.
   */
  async download(): Promise<void> {
    const document = await this.document();
    const downloadButton = await document.getByText("Download");
    return downloadButton.click();
  }

  /**
   * Trigger a download and wait for it to complete.
   *
   * @returns Download details.
   */
  async waitForDownload(): Promise<BrowserDownload> {
    return this.waitForDownloadOnDisk(() => this.download());
  }

  /**
   * Reload the page after clearing local storage.
   */
  async reload() {
    const page = await this.page;
    await page.evaluate(() => {
      if (document.domain === "localhost") {
        window.localStorage.clear();
      }
    });
    await page.goto("http://localhost:3000");
  }

  /**
   * Clean up, including the browser and downloads temporary folder.
   */
  async dispose() {
    await fsp.rmdir(this.downloadPath, { recursive: true });
    const page = await this.page;
    return page.browser().close();
  }

  private async selectSideBar(tabName: string) {
    const document = await this.document();
    const tab = await document.getByRole("tab", {
      name: tabName,
    });
    return tab.click();
  }

  private async document(): Promise<puppeteer.ElementHandle<Element>> {
    const page = await this.page;
    return page.getDocument();
  }

  private async waitForDownloadOnDisk(
    triggerDownload: () => Promise<void>,
    timeout: number = 5000
  ): Promise<BrowserDownload> {
    const listDir = async () => {
      const listing = await fsp.readdir(this.downloadPath);
      return new Set(listing.filter((x) => !x.endsWith(".crdownload")));
    };

    const before = await listDir();
    await triggerDownload();

    const startTime = performance.now();
    while (true) {
      const after = await listDir();
      before.forEach((x) => after.delete(x));
      if (after.size === 1) {
        const filename = after.values().next().value;
        const data = await fsp.readFile(path.join(this.downloadPath, filename));
        return { filename, data };
      }
      if (after.size > 1) {
        throw new Error("Unexpected extra file in downloads directory");
      }
      if (performance.now() - startTime > timeout) {
        throw new Error("Timeout waiting for puppeteer download");
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
}
