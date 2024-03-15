/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { test } from "./app-test-fixtures.js";

const showFullSignature =
  "show(image, delay=400, wait=True, loop=False, clear=False)";

test.describe("autocomplete", () => {
  test("shows autocomplete as you type", async ({ app }) => {
    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.s");

    // Initial completions
    await app.findCompletionOptions(["scroll", "set_pixel", "show"]);
    await app.findCompletionActiveOption("scroll(text)");

    // Further refinement
    await app.page.keyboard.press("h");
    await app.findCompletionActiveOption("show(image)");

    // Accepted completion
    await app.acceptCompletion("show");
    await app.findVisibleEditorContents("display.show()");
  });

  test("ranks Image above image=", async ({ app }) => {
    // This particular case has been tweaked in a somewhat fragile way.
    // See the boost code in autocompletion.ts

    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.show(image");

    await app.findCompletionOptions(["Image", "image="]);
  });

  test("autocomplete can navigate to API toolkit content", async ({ app }) => {
    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.sho");

    await app.findCompletionActiveOption("show(image)");

    await app.followCompletionOrSignatureDocumentionLink("API");

    await app.findActiveApiEntry(showFullSignature, "h4");
  });

  test("autocomplete can navigate to Reference toolkit content", async ({
    app,
  }) => {
    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.sho");
    await app.findCompletionActiveOption("show(image)");
    await app.followCompletionOrSignatureDocumentionLink("Help");
    await app.findActiveApiEntry("Show", "h3");
  });

  test("shows signature help after autocomplete", async ({ app }) => {
    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.sho");
    await app.acceptCompletion("show");

    await app.findSignatureHelp(showFullSignature);
  });

  test("does not insert brackets for import completion", async ({ app }) => {
    // This relies on undocumented Pyright behaviour so important to cover at a high level.
    await app.selectAllInEditor();
    await app.typeInEditor("from audio import is_pla");
    await app.acceptCompletion("is_playing");

    await app.findVisibleEditorContents(/is_playing$/);
  });

  test("signature can navigate to API toolkit content", async ({ app }) => {
    await app.selectAllInEditor();
    // The closing bracket is autoinserted.
    await app.typeInEditor("from microbit import *\ndisplay.show(");

    await app.findSignatureHelp(showFullSignature);

    await app.followCompletionOrSignatureDocumentionLink("API");

    await app.findActiveApiEntry(showFullSignature, "h4");
  });

  test("signature can navigate to Reference toolkit content", async ({
    app,
  }) => {
    await app.selectAllInEditor();
    // The closing bracket is autoinserted.
    await app.typeInEditor("from microbit import *\ndisplay.show(");
    await app.findSignatureHelp(showFullSignature);
    await app.followCompletionOrSignatureDocumentionLink("Help");
    await app.findActiveApiEntry("Show", "h3");
  });
});
