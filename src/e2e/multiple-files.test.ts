import { App } from "./app";

describe("Browser - multiple and missing file cases", () => {
  const app = new App();
  beforeEach(app.reload.bind(app));
  afterAll(app.dispose.bind(app));

  it("Copes with hex with no Python files", async () => {
    // Probably best for this to be an error or else we
    // need to cope with no Python at all to display.
    await app.open("src/fs/microbit-micropython-v2.hex");

    await app.findAlertText(
      "Cannot load file",
      "No appended code found in the hex file"
    );
  });

  it("Create a new file", async () => {
    await app.createNewFile("test");

    // This should happen automatically but is not yet implemented.
    await app.switchToEditing("test.py");

    await app.findVisibleEditorContents(/Your new file/);
  });

  it("Prevents deleting main.py", async () => {
    expect(await app.canDeleteFile("main.py")).toEqual(false);
  });

  it("Copes with currently open file being updated (module)", async () => {
    await app.open("testData/module.py");
    await app.switchToEditing("module.py");
    await app.findVisibleEditorContents(/1.0.0/);

    await app.open("testData/updated/module.py");

    await app.findVisibleEditorContents(/1.1.0/);
    await app.findVisibleEditorContents(/Now with documentation/);
  });

  it("Copes with currently open file being deleted", async () => {
    await app.open("testData/module.py");
    await app.switchToEditing("module.py");

    await app.deleteFile("module.py");

    await app.findVisibleEditorContents(/Hello, World/);
  });

  it("Doesn't offer editor for non-Python file", async () => {
    await app.uploadFile("testData/null.dat");

    expect(await app.canSwitchToEditing("null.dat")).toEqual(false);
  });

  it("Muddles through if given non-UTF-8 main.py", async () => {
    // We could start detect this on open but not sure it's worth it introducting the error cases.
    // If we need to recreate the hex then just fill the file with 0xff.
    await app.open("testData/invalid-utf-8.hex");

    await app.findVisibleEditorContents(
      /^����������������������������������������������������������������������������������������������������$/
    );
  });
});
