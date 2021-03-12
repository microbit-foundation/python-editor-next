import {
  generateId,
  getFileExtension,
  isPythonMicrobitModule,
} from "./fs-util";

describe("getFileExtension", () => {
  it("gets extension", () => {
    expect(getFileExtension("foo.py")).toEqual("py");
    expect(getFileExtension("foo.PY")).toEqual("PY");
    expect(getFileExtension("a.b.c")).toEqual("c");
  });
  it("returns undefined for no dot or empty string", () => {
    expect(getFileExtension("")).toBeUndefined();
    expect(getFileExtension(".")).toBeUndefined();
    expect(getFileExtension(".")).toBeUndefined();
  });
  it("doesn't mess with whitespace", () => {
    // Not sure it's worth dealing with this.
    expect(getFileExtension("foo.bar ")).toEqual("bar ");
  });
});

describe("isPythonMicrobitModule", () => {
  const example = "from microbit import *\ndisplay.scroll('Hi')\n";

  it("identifies our modules but not other Python", () => {
    expect(isPythonMicrobitModule("# microbit-module:")).toEqual(true);
    expect(isPythonMicrobitModule("# microbit-module: something\n")).toEqual(
      true
    );

    expect(
      isPythonMicrobitModule("# microbit-module: something\n" + example)
    ).toEqual(true);
    expect(isPythonMicrobitModule("")).toEqual(false);
    expect(isPythonMicrobitModule(example)).toEqual(false);
  });

  it("works with windows line endings", () => {
    expect(
      isPythonMicrobitModule("\r\n# microbit-module: something\r\n")
    ).toEqual(true);
  });

  it("works with linux line endings", () => {});
  it("checks only first three lines", () => {
    expect(isPythonMicrobitModule("# microbit-module:")).toEqual(true);
    expect(isPythonMicrobitModule("\n# microbit-module:")).toEqual(true);
    expect(isPythonMicrobitModule("\n\n# microbit-module:")).toEqual(true);
    expect(isPythonMicrobitModule("\n\n\n# microbit-module:")).toEqual(false);
  });
});

describe("generateId", () => {
  it("returns different ids", () => {
    // We don't really care much about these ids. They're just react keys at the moment.
    expect(generateId() === generateId()).toEqual(false);
  });
});
