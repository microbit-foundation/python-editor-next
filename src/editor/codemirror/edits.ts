import { syntaxTree } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { SyntaxNode } from "@lezer/common";

export const pythonWithImportsMediaType = "application/x.python-with-imports";
// We augment input.drop so we can trigger signature help.
export const inputDropApiDocs = "input.drop.apidocs";

export interface RequiredImport {
  module: string;
  name?: string;
}

export interface CodeWithImports {
  code: string;
  requiredImport: RequiredImport;
}

type SimpleChangeSpec = {
  from: number;
  to?: number;
  insert: string;
};

export const calculateImportChanges = (
  state: EditorState,
  required: RequiredImport
): SimpleChangeSpec[] => {
  const allCurrent = currentImports(state);
  const changes = calculateImportChangesInternal(allCurrent, required);
  if (changes.length > 0 && allCurrent.length === 0) {
    // Two blank lines.
    changes[changes.length - 1].insert += "\n\n";
  }
  return changes;
};

const calculateImportChangesInternal = (
  allCurrent: Import[],
  required: RequiredImport
): SimpleChangeSpec[] => {
  const from = allCurrent.length
    ? allCurrent[allCurrent.length - 1].node.to
    : 0;
  const to = from;
  const prefix = to > 0 ? "\n" : "";

  if (!required.name) {
    // Module import.
    if (
      allCurrent.find(
        (c) => !c.names && c.module === required.module && !c.alias
      )
    ) {
      return [];
    } else {
      return [{ from, to, insert: `${prefix}import ${required.module}` }];
    }
  } else if (required.name === "*") {
    // Wildcard import.
    if (
      allCurrent.find(
        (c) =>
          c.names?.length === 1 &&
          c.names[0].name === "*" &&
          c.module === required.module
      )
    ) {
      return [];
    } else {
      return [
        { from, to, insert: `${prefix}from ${required.module} import *` },
      ];
    }
  } else {
    // Importing some name from a module.
    const partMatches = allCurrent.filter(
      (c) =>
        c.names &&
        !(c.names?.length === 1 && c.names[0].name === "*") &&
        c.module === required.module
    );
    const fullMatch = partMatches.find((nameImport) =>
      nameImport.names?.find((n) => n.name === required.name && !n.alias)
    );
    if (fullMatch) {
      return [];
    } else if (partMatches.length > 0) {
      return [
        {
          from: partMatches[0].node.to,
          to: partMatches[0].node.to,
          insert: `, ${required.name}`,
        },
      ];
    } else {
      return [
        {
          from,
          to,
          insert: `${prefix}from ${required.module} import ${required.name}`,
        },
      ];
    }
  }
};

interface Import {
  kind: "import" | "from";
  module: string;
  alias?: string;
  names?: ImportedName[];
  node: SyntaxNode;
}

interface ImportedName {
  name: string;
  alias?: string;
}

const currentImports = (state: EditorState): Import[] => {
  const tree = syntaxTree(state);
  const imports: (Import | undefined)[] = tree.topNode
    .getChildren("ImportStatement")
    .map((existingImport) => {
      // The tree is flat here, so making sense of this is distressingly like parsing it again.
      // (1) kw<"from"> (("." | "...")+ dottedName? | dottedName) kw<"import"> ("*" | importList | importedNames)
      // (2) kw<"import"> dottedName (kw<"as"> VariableName)? |
      if (existingImport.firstChild?.name === "from") {
        const moduleNode = existingImport.getChild("VariableName");
        if (!moduleNode) {
          return undefined;
        }
        const module = state.doc.sliceString(moduleNode.from, moduleNode.to);
        const importNode = existingImport.getChild("import");
        if (!importNode) {
          return undefined;
        }
        const names: ImportedName[] = [];
        let current: ImportedName | undefined;
        for (
          let node = importNode.nextSibling;
          node;
          node = node?.nextSibling
        ) {
          const isVariableName = node.name === "VariableName";
          if (current) {
            if (isVariableName) {
              current.alias = state.sliceDoc(node.from, node.to);
            } else if (
              node.name === "as" ||
              node.name === "(" ||
              node.name === ")"
            ) {
              continue;
            } else if (node.name === ",") {
              names.push(current);
              current = undefined;
            }
          } else {
            current = {
              name: state.sliceDoc(node.from, node.to),
            };
          }
        }
        if (current) {
          names.push(current);
        }
        return { module, names, kind: "from", node: existingImport };
      } else if (existingImport.firstChild?.name === "import") {
        const variableNames = existingImport.getChildren("VariableName");
        if (variableNames.length === 0) {
          return undefined;
        }
        return {
          module: state.doc.sliceString(
            variableNames[0].from,
            variableNames[0].to
          ),
          alias:
            variableNames.length === 2
              ? state.doc.sliceString(
                  variableNames[1].from,
                  variableNames[1].to
                )
              : undefined,
          kind: "import",
          node: existingImport,
        };
      }
      return undefined;
    });
  return imports.filter((x: Import | undefined): x is Import => !!x);
};
