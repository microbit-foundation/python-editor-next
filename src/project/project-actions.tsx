import { saveAs } from "file-saver";
import Separate, { br } from "../common/Separate";
import { ActionFeedback } from "../common/use-action-feedback";
import { BoardId } from "../device/board-id";
import {
  ConnectionStatus,
  MicrobitWebUSBConnection,
  WebUSBError,
} from "../device/device";
import { DownloadData, FileSystem, MAIN_FILE } from "../fs/fs";
import {
  getFileExtension,
  isPythonMicrobitModule,
  readFileAsText,
} from "../fs/fs-util";
import translation from "../translation";

class HexGenerationError extends Error {}

/**
 * Key actions.
 *
 * These actions all perform their own error handling and
 * give appropriate feedback to the user if they fail.
 */
export class ProjectActions {
  constructor(
    private fs: FileSystem,
    private device: MicrobitWebUSBConnection,
    private actionFeedback: ActionFeedback
  ) {}

  /**
   * Connect to the device if possible, otherwise show feedback.
   */
  connect = async () => {
    if (this.device.status === ConnectionStatus.NOT_SUPPORTED) {
      this.actionFeedback.expectedError({
        title: "WebUSB not supported",
        description: "Download the hex file or try Chrome or Microsoft Edge",
      });
    } else {
      try {
        await this.device.connect();
      } catch (e) {
        this.handleWebUSBError(e);
      }
    }
  };

  /**
   * Disconnect from the device.
   */
  disconnect = async () => {
    try {
      await this.device.disconnect();
    } catch (e) {
      this.handleWebUSBError(e);
    }
  };

  /**
   * Open a file.
   *
   * Replaces the open project for hex or regular Python files.
   * Adds to or updates modules in the current project for micro:bit Python modules.
   *
   * @param file the file from drag and drop or an input element.
   */
  open = async (file: File): Promise<void> => {
    const errorTitle = "Cannot load file";
    const extension = getFileExtension(file.name)?.toLowerCase();

    if (extension === "py") {
      const code = await readFileAsText(file);
      if (!code) {
        this.actionFeedback.expectedError({
          title: errorTitle,
          description: "The file was empty.",
        });
      } else if (isPythonMicrobitModule(code)) {
        const exists = this.fs.exists(file.name);
        const change = exists ? "Updated" : "Added";
        this.fs.addOrUpdateModule(file.name, code);
        this.actionFeedback.success({
          title: `${change} module ${file.name}`,
        });
      } else {
        this.fs.replaceWithMainContents(code);
        this.actionFeedback.success({
          title: "Loaded " + file.name,
        });
      }
    } else if (extension === "hex") {
      const hex = await readFileAsText(file);
      await this.fs.replaceWithHexContents(hex);
      this.actionFeedback.success({
        title: "Loaded " + file.name,
      });
    } else if (extension === "mpy") {
      this.actionFeedback.warning({
        title: errorTitle,
        description: translation.load["mpy-warning"],
      });
    } else {
      this.actionFeedback.warning({
        title: errorTitle,
        description: translation.load["extension-warning"],
      });
    }
  };

  /**
   * Flash the device.
   *
   * @param progress Progress handler called with 0..1 then undefined.
   */
  flash = async (
    progress: (value: number | undefined) => void
  ): Promise<void> => {
    if (this.device.status === ConnectionStatus.NOT_SUPPORTED) {
      this.actionFeedback.expectedError({
        title: "WebUSB not supported",
        description: "Download the hex file or try Chrome or Microsoft Edge",
      });
      return;
    }

    const dataSource = async (boardId: BoardId) => {
      try {
        return await this.fs.toHexForFlash(boardId);
      } catch (e) {
        throw new HexGenerationError(e.message);
      }
    };

    try {
      await this.device.flash(dataSource, { partial: true, progress });
    } catch (e) {
      if (e instanceof HexGenerationError) {
        this.actionFeedback.expectedError({
          title: "Failed to build the hex file",
          description: e.message,
        });
      } else {
        this.handleWebUSBError(e);
      }
    }
  };

  /**
   * Trigger a browser download with a universal hex file.
   */
  download = async () => {
    let download: DownloadData | undefined;
    try {
      download = await this.fs.toHexForDownload();
    } catch (e) {
      this.actionFeedback.expectedError({
        title: "Failed to build the hex file",
        description: e.message,
      });
      return;
    }
    const blob = new Blob([download.intelHex], {
      type: "application/octet-stream",
    });
    saveAs(blob, download.filename);
  };

  /**
   * Download an individual file.
   *
   * @param filename the file to download.
   */
  downloadFile = async (filename: string) => {
    const projectName = this.fs.state.projectName;
    const downloadName =
      filename === MAIN_FILE ? `${projectName}.py` : filename;
    try {
      const content = this.fs.read(filename);
      // For now we assume the file is Python.
      const blob = new Blob([content], { type: "text/x-python" });
      saveAs(blob, downloadName);
    } catch (e) {
      this.actionFeedback.unexpectedError(e);
    }
  };

  /**
   * Delete a file.
   *
   * @param filename the file to delete.
   */
  deleteFile = async (filename: string) => {
    try {
      this.fs.remove(filename);
    } catch (e) {
      this.actionFeedback.unexpectedError(e);
    }
  };

  /**
   * Set the project name.
   *
   * @param name The new name.
   */
  setProjectName = async (name: string) => {
    this.fs.setProjectName(name);
  };

  private handleWebUSBError(e: any) {
    if (e instanceof WebUSBError) {
      this.actionFeedback.expectedError({
        title: e.title,
        description: (
          <Separate separator={br}>
            {[e.message, e.description].filter(Boolean)}
          </Separate>
        ),
      });
    } else {
      this.actionFeedback.unexpectedError(e);
    }
  }
}
