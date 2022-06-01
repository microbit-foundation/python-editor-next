import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { lineNumFromUint8Array } from "../../common/text-util";
import { deployment } from "../../deployment";
import { CodeInsertType } from "./dnd";
import { calculateChanges } from "./edits";

export interface CopyContext {
  code: string;
  type: CodeInsertType;
  id?: string;
}

let copyContext: CopyContext | undefined;

/**
 * Set the copied code.
 *
 * There's no way to pass the code type on the ClipboardItem when
 * manually creating writing data to the clipboard.
 *
 * Set it in handleCopyCode and clear it on paste below.
 */
export const setCopyContext = (context: CopyContext | undefined) => {
  copyContext = context;
};

const copyPasteHandlers = () => {
  const textEncoder = new TextEncoder();
  return [
    EditorView.domEventHandlers({
      paste(event, view) {
        if (!view.state.facet(EditorView.editable) || !copyContext) {
          return;
        }
        event.preventDefault();

        // Should we use lineCount here, or follow the dnd logging?
        // If we use lineCount, should we ignore imports and empty lines?
        const lineCount = lineNumFromUint8Array(
          // Ignore leading/trailing lines.
          textEncoder.encode(copyContext.code.trim())
        );
        deployment.logging.event({
          type: "paste",
          value: lineCount,
        });

        let lineNumber = 0;
        const lineElement = event
          .composedPath()
          .find((e) => (e as HTMLElement).classList.contains("cm-line"));
        const lineElements = document.querySelectorAll(
          '[data-testid="editor"] .cm-line'
        );
        lineElements.forEach((e, i) => {
          if (e === lineElement) {
            // + 1 for current line (or above existing text).
            // + 2 for for line below.
            lineNumber = i + 1;
          }
        });

        view.dispatch(
          calculateChanges(
            view.state,
            copyContext.code,
            copyContext.type,
            lineNumber
          )
        );
        view.focus();
        // How long should we keep this on the 'clipboard'?
        copyContext = undefined;
      },
    }),
  ];
};

export const copyPasteSupport = (): Extension => [copyPasteHandlers()];