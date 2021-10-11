import { Button, IconButton } from "@chakra-ui/button";
import { useClipboard } from "@chakra-ui/hooks";
import { Box, BoxProps, HStack, Text, VStack } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { HTMLChakraProps } from "@chakra-ui/system";
import { Tooltip } from "@chakra-ui/tooltip";
import sortBy from "lodash.sortby";
import React, { useEffect, useMemo, useState } from "react";
import { RiFileCopy2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import ExpandCollapseIcon from "../common/ExpandCollapseIcon";
import { renderMarkdown } from "../editor/codemirror/language-server/documentation";
import {
  apiDocs,
  ApiDocsBaseClass,
  ApiDocsEntry,
  ApiDocsFunctionParameter,
  ApiDocsResponse,
} from "../language-server/apidocs";
import { useLanguageServerClient } from "../language-server/language-server-hooks";
import { pullModulesToTop } from "./apidocs-util";

const ApiDocsArea = () => {
  const client = useLanguageServerClient();
  const [apidocs, setApiDocs] = useState<ApiDocsResponse | undefined>();
  useEffect(() => {
    const load = async () => {
      if (client) {
        await client.initialize();
        const docs = await apiDocs(client);
        pullModulesToTop(docs);
        setApiDocs(docs);
      }
    };
    load();
  }, [client]);
  return (
    <Box height="100%" p={3} pt={4}>
      {apidocs ? (
        <ModuleDocs docs={apidocs} />
      ) : (
        <Spinner label="Loading API documentation" alignSelf="center" />
      )}
    </Box>
  );
};

interface ModuleDocsProps {
  docs: ApiDocsResponse;
}

const ModuleDocs = ({ docs }: ModuleDocsProps) => {
  return (
    <>
      {sortBy(Object.values(docs), (m) => m.fullName).map((module) => (
        <DocEntryNode
          key={module.id}
          docs={module}
          borderRadius="md"
          _last={{ pb: 4 }}
        />
      ))}
    </>
  );
};

const kindToFontSize: Record<string, any> = {
  module: "2xl",
  class: "lg",
};

const kindToHeading: Record<string, any> = {
  module: "h2",
  class: "h3",
  variable: "h4",
  function: "h4",
};

const kindToSpacing: Record<string, any> = {
  module: 8,
  class: 5,
  variable: 3,
  function: 3,
};

interface DocEntryNodeProps extends BoxProps {
  docs: ApiDocsEntry;
}

const DocEntryNode = ({ docs, mt, mb, ...others }: DocEntryNodeProps) => {
  const { kind, name, fullName, children, params, docString, baseClasses } =
    docs;
  const variableOrFunction = kind === "variable" || kind === "function";
  const [isShowingDetail, setShowingDetail] = useState(false);
  const groupedChildren = useMemo(() => {
    const filteredChildren = filterChildren(children);
    return filteredChildren
      ? groupBy(filteredChildren, (c) => c.kind)
      : undefined;
  }, [children]);
  const docStringFirstParagraph = docString
    ? docString.split(/\n{2,}/g)[0]
    : undefined;
  const hasDocStringDetail =
    docString &&
    docStringFirstParagraph &&
    docString.length > docStringFirstParagraph.length;
  const activeDocString = isShowingDetail ? docString : docStringFirstParagraph;
  const { signature, hasSignatureDetail } = buildSignature(
    kind,
    params,
    isShowingDetail
  );
  const hasDetail = hasDocStringDetail || hasSignatureDetail;

  return (
    <Box
      id={fullName}
      wordBreak="break-word"
      mb={kindToSpacing[kind]}
      p={variableOrFunction ? 2 : undefined}
      backgroundColor={variableOrFunction ? "gray.10" : undefined}
      borderRadius="md"
      {...others}
      _hover={{
        "& button": {
          display: "flex",
        },
      }}
    >
      <Box>
        <HStack>
          <Text fontSize={kindToFontSize[kind]} as={kindToHeading[kind]}>
            <Text as="span" fontWeight="semibold">
              {formatName(kind, fullName, name)}
            </Text>
            {signature}
          </Text>
          {variableOrFunction && <CopyButton docs={docs} display="none" />}
        </HStack>

        {baseClasses && baseClasses.length > 0 && (
          <BaseClasses value={baseClasses} />
        )}
        <VStack alignItems="stretch" spacing={1}>
          {activeDocString && <DocString value={activeDocString} />}
          {kind !== "module" && kind !== "class" && (
            <HStack justifyContent="flex-end">
              {hasDetail && (
                <Button
                  color="unset"
                  variant="link"
                  size="xs"
                  onClick={() => setShowingDetail(!isShowingDetail)}
                  rightIcon={<ExpandCollapseIcon open={isShowingDetail} />}
                  _hover={{
                    textDecoration: "none",
                  }}
                  p={1}
                  pt={1.5}
                  pb={1.5}
                  aria-label={
                    isShowingDetail
                      ? `Show less for ${name}`
                      : `Show more for ${name}`
                  }
                >
                  {isShowingDetail ? "Show less" : "Show more"}
                </Button>
              )}
            </HStack>
          )}
        </VStack>
      </Box>
      {groupedChildren && groupedChildren.size > 0 && (
        <Box pl={kind === "class" ? 2 : 0} mt={3}>
          <Box
            pl={kind === "class" ? 2 : 0}
            borderLeftWidth={kind === "class" ? 1 : undefined}
          >
            {["function", "variable", "class"].map(
              (childKind) =>
                groupedChildren?.get(childKind as any) && (
                  <React.Fragment key={childKind}>
                    <Text fontWeight="lg" mb={2} mt={5}>
                      {groupHeading(kind, childKind)}
                    </Text>
                    {groupedChildren?.get(childKind as any)?.map((c) => (
                      <DocEntryNode key={c.id} docs={c} />
                    ))}
                  </React.Fragment>
                )
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

const groupHeading = (kind: string, childKind: string): string => {
  switch (childKind) {
    case "variable":
      return "Fields";
    case "class":
      return "Classes";
    case "function":
      return kind === "class" ? "Methods" : "Functions";
    default: {
      throw new Error("Unexpected");
    }
  }
};

const formatName = (kind: string, fullName: string, name: string): string => {
  // Add zero width spaces to allow breaking
  return kind === "module" ? fullName.replaceAll(/\./g, "\u200b.\u200b") : name;
};

const buildSignature = (
  kind: string,
  params: ApiDocsFunctionParameter[] | undefined,
  detailed: boolean
): { signature?: string; hasSignatureDetail: boolean } => {
  if (kind === "function" && params) {
    const signature =
      "(" +
      params
        .filter(
          (parameter, index) =>
            !(index === 0 && parameter.name === "self") &&
            (detailed || parameter.defaultValue === undefined)
        )
        .map((parameter) => {
          const prefix =
            parameter.category === "varargDict"
              ? "**"
              : parameter.category === "varargList"
              ? "*"
              : "";
          const suffix = parameter.defaultValue
            ? `=${parameter.defaultValue}`
            : "";
          return prefix + parameter.name + suffix;
        })
        .join(", ") +
      ")";
    return {
      signature,
      hasSignatureDetail: !!params.find((p) => p.defaultValue !== undefined),
    };
  }
  return { signature: undefined, hasSignatureDetail: false };
};

const isInitOrOtherNonDunderMethod = (c: ApiDocsEntry) =>
  !c.name.endsWith("__") || c.name === "__init__";

const filterChildren = (
  children: ApiDocsEntry[] | undefined
): ApiDocsEntry[] | undefined =>
  children ? children.filter(isInitOrOtherNonDunderMethod) : undefined;

function groupBy<T, U>(values: T[], fn: (x: T) => U): Map<U, T[]> {
  const result = new Map<U, T[]>();
  for (const v of values) {
    const k = fn(v);
    let array = result.get(k);
    if (!array) {
      array = [];
      result.set(k, array);
    }
    array.push(v);
  }
  return result;
}

const BaseClasses = ({ value }: { value: ApiDocsBaseClass[] }) => {
  const prefix = value.length === 1 ? "base class " : "base classes: ";
  return (
    <Text pl={2}>
      {prefix}
      {value.map((bc) => (
        <a key={bc.fullName} href={"#" + bc.fullName}>
          {bc.name}
        </a>
      ))}
    </Text>
  );
};

interface DocStringProps {
  value: string;
}

const DocString = React.memo(({ value }: DocStringProps) => {
  const html = renderMarkdown(value);
  return (
    <Box
      className="docs-markdown"
      fontSize="sm"
      mt={2}
      fontWeight="normal"
      dangerouslySetInnerHTML={html}
    />
  );
});

interface CopyButtonProps extends HTMLChakraProps<"button"> {
  docs: ApiDocsEntry;
}

const CopyButton = ({ docs }: CopyButtonProps) => {
  const { hasCopied, onCopy } = useClipboard(clipboardText(docs));
  const intl = useIntl();
  const label = intl.formatMessage({ id: hasCopied ? "copied" : "copy" });
  return (
    <Tooltip hasArrow placement="right" label="Copy to clipboard">
      <IconButton
        size="sm"
        variant="ghost"
        onClick={onCopy}
        icon={<RiFileCopy2Line />}
        aria-label={label}
      />
    </Tooltip>
  );
};

const clipboardText = (docs: ApiDocsEntry) => {
  const parts = docs.fullName.split(".");
  const isMicrobit = parts[0] === "microbit";
  let use = isMicrobit ? parts.slice(1) : parts;
  return use.join(".") + (docs.kind === "function" ? "()" : "");
};

export default ApiDocsArea;
