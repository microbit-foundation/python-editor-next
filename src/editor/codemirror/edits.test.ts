import { EditorState } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { calculateChanges } from "./edits";
import { EditorView } from "@codemirror/view";

describe("edits", () => {
  const check = (initial: string, additional: string, expected: string) => {
    const state = EditorState.create({
      doc: initial,
      extensions: [python()],
    });
    const view = new EditorView({ state });
    const transaction = state.update({
      changes: calculateChanges(state, additional),
    });
    view.update([transaction]);
    expect(view.state.sliceDoc(0)).toEqual(expected);
  };

  it("first import from case - wildcard", () => {
    check("", "from microbit import *", "from microbit import *\n\n");
  });

  it("first import from case - name", () => {
    check(
      "",
      "from random import randrange",
      "from random import randrange\n\n"
    );
  });

  it("first import module case", () => {
    check("", "import audio", "import audio\n\n");
  });

  it("existing import module case", () => {
    check("import audio", "import audio", "import audio");
  });

  it("existing import module case - as variant", () => {
    check(
      "import audio as foo",
      "import audio",
      "import audio as foo\nimport audio"
    );
  });

  it("existing import from case - wildcard", () => {
    check(
      "from microbit import *",
      "from microbit import *",
      "from microbit import *"
    );
  });

  it("existing import from case - name", () => {
    check(
      "from random import randrange",
      "from random import randrange",
      "from random import randrange"
    );
  });

  it("existing import from case - alias", () => {
    check(
      "from random import randrange as foo",
      "from random import randrange",
      "from random import randrange as foo, randrange"
    );
  });

  it("existing from import new name", () => {
    check(
      "from random import getrandbits",
      "from random import randrange",
      "from random import getrandbits, randrange"
    );
  });

  it("copes with invalid imports", () => {
    check(
      "import\nfrom\n",
      "from random import randrange",
      "from random import randrange\n\nimport\nfrom\n"
    );
  });

  it("combo imports", () => {
    check(
      "from microbit import *\nfrom random import randrange\nimport radio\n",
      "from microbit import *\nfrom random import rantint\nimport micropython\n",
      "from microbit import *\nfrom random import randrange, rantint\nimport radio\nimport micropython\n"
    );
  });
});
