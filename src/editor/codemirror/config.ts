import {
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  KeyBinding,
} from "@codemirror/view";
import { Extension, EditorState, Prec, Compartment } from "@codemirror/state";
import { history, historyKeymap } from "@codemirror/history";
import { indentOnInput, indentUnit } from "@codemirror/language";
import { lineNumbers } from "@codemirror/gutter";
import { defaultKeymap, indentLess, indentMore } from "@codemirror/commands";
import { bracketMatching } from "@codemirror/matchbrackets";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/closebrackets";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { commentKeymap } from "@codemirror/comment";
import { defaultHighlightStyle } from "@codemirror/highlight";
import { lintKeymap } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";
import { python } from "@codemirror/lang-python";
import { completion } from "./completion";
import { codeFontFamily } from "../../theme";

const customTabBinding: KeyBinding = {
  key: "Tab",
  run: indentMore,
  shift: indentLess,
};

export const themeExtensionsCompartment = new Compartment();

export const themeExtensions = (fontSizePt: number) => {
  const fontSize = `${fontSizePt}pt`;
  const fontFamily = codeFontFamily;
  return EditorView.theme({
    ".cm-content": {
      fontSize,
      fontFamily,
      padding: 0,
    },
    ".cm-gutters": {
      // Make it easier to copy code dragging from the left without line numbers.
      userSelect: "none",
      backgroundColor: "var(--code-background)",
      fontSize,
      fontFamily,
      borderRight: "unset",
      paddingRight: "1rem",
    },
    ".cm-gutter": {
      width: "5rem",
    },
    ".cm-completionIcon": {
      // Seems broken by default
      width: "auto",
      // But they're also cryptic, so hide until we can improve.
      display: "none",
    },
    ".cm-completionLabel": {
      fontSize,
      fontFamily,
    },
    ".cm-activeLine": {
      // The default CM theme sets a background color.
      backgroundColor: "unset",
      outline: "1px solid var(--chakra-colors-gray-200)",
    },
    // $wrap can't be styled here, see App.css.
  });
};

const indentSize = 4;
export const editorConfig: Extension = [
  EditorView.contentAttributes.of({
    // Probably a good idea? https://discuss.codemirror.net/t/ios-turn-off-autocorrect/2912
    autocorrect: "off",
    // This matches Ace/Monaco behaviour.
    autocapitalize: "none",
    // Disable Grammarly.
    "data-gramm": "false",
  }),
  lineNumbers(),
  highlightSpecialChars(),
  history(),
  drawSelection(),
  indentOnInput(),
  Prec.fallback(defaultHighlightStyle),
  bracketMatching(),
  closeBrackets(),
  autocompletion({
    override: completion,
  }),
  highlightActiveLine(),

  keymap.of([
    // Added, but see https://codemirror.net/6/examples/tab/ for accessibility discussion.
    customTabBinding,
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...historyKeymap,
    ...commentKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),

  // Fixed custom extensions.
  EditorState.tabSize.of(indentSize), // But hopefully not used!
  indentUnit.of(" ".repeat(indentSize)),
  python(),
];
