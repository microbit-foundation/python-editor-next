import { Button } from "@chakra-ui/button";
import { Box, BoxProps, HStack, Stack, Text } from "@chakra-ui/layout";
import { Portal } from "@chakra-ui/portal";
import { forwardRef } from "@chakra-ui/system";
import { Ref, RefObject, useLayoutEffect, useRef, useState } from "react";
import { RiArrowRightLine } from "react-icons/ri";
import { useSplitViewContext } from "../../common/SplitView/context";
import {
  ToolkitNavigationState,
  ToolkitTopic,
  ToolkitTopicItem,
} from "./model";

interface TopicItemProps extends BoxProps {
  topic: ToolkitTopic;
  item: ToolkitTopicItem;
  detail?: boolean;
  onNavigate: (next: ToolkitNavigationState) => void;
}

const TopicItem = ({
  topic,
  item,
  detail,
  onNavigate,
  ...props
}: TopicItemProps) => {
  const [hovering, setHovering] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  const lines = item.code.trim().split("\n").length;
  const textHeight = lines * 1.5 + "em";
  const codeHeight = `calc(${textHeight} + var(--chakra-space-5) + var(--chakra-space-5))`;
  return (
    <Stack spacing={3} {...props}>
      <Text as="h3" fontSize="lg" fontWeight="semibold">
        {item.name}
      </Text>
      <Text fontSize="sm">{item.text}</Text>
      <Box>
        <Box height={codeHeight}>
          <Code
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            value={item.code}
            position="absolute"
            ref={codeRef}
          />
          {hovering && (
            <CodePopUp
              setHovering={setHovering}
              value={item.code}
              codeRef={codeRef}
            />
          )}
        </Box>
        <HStack spacing={3}>
          <Button
            fontWeight="normal"
            color="white"
            borderColor="rgb(141, 141, 143)"
            bgColor="rgb(141, 141, 143)"
            borderTopRadius="0"
            borderBottomRadius="xl"
            variant="ghost"
            size="sm"
          >
            Insert code
          </Button>
          {!detail && item.furtherText && (
            <Button
              onClick={() =>
                onNavigate({
                  topicId: topic.name,
                  itemId: item.name,
                })
              }
              fontWeight="normal"
              color="brand.500"
              variant="unstyled"
              size="sm"
              rightIcon={<RiArrowRightLine />}
            >
              More
            </Button>
          )}
        </HStack>
      </Box>
      {detail && <Text fontSize="sm">{item.furtherText}</Text>}
    </Stack>
  );
};

interface CodePopUpProps extends BoxProps {
  setHovering: (hovering: boolean) => void;
  value: string;
  codeRef: RefObject<HTMLDivElement | null>;
}

// We draw the same code over the top in a portal so we can draw it
// above the scrollbar.
const CodePopUp = ({ setHovering, codeRef, value }: CodePopUpProps) => {
  // We need to re-render, we don't need the value.
  useScrollTop("left-panel-viewport");
  useSplitViewContext();

  if (!codeRef.current) {
    return null;
  }
  return (
    <Portal>
      <Code
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        value={value}
        position="absolute"
        top={codeRef.current.getBoundingClientRect().top + "px"}
        left={codeRef.current.getBoundingClientRect().left + "px"}
      />
    </Portal>
  );
};

interface CodeProps extends BoxProps {
  value: string;
  ref?: Ref<HTMLDivElement>;
}

const Code = forwardRef<CodeProps, "pre">(
  ({ value, ...props }: CodeProps, ref) => {
    return (
      <Text
        ref={ref}
        as="pre"
        backgroundColor="rgb(247,245,242)"
        padding={5}
        borderTopRadius="lg"
        boxShadow="rgba(0, 0, 0, 0.18) 0px 2px 6px;"
        fontFamily="Source Code Pro, monospace"
        {...props}
      >
        {value}
      </Text>
    );
  }
);

const useScrollTop = (id: string) => {
  const [scrollTop, setScrollTop] = useState(0);
  useLayoutEffect(() => {
    const parent = document.getElementById(id);
    if (!parent) {
      throw new Error();
    }
    setScrollTop(parent.scrollTop);
    const listener = () => setScrollTop(parent.scrollTop);
    parent.addEventListener("scroll", listener);
    return () => {
      parent.removeEventListener("scroll", listener);
    };
  }, [id]);
  return scrollTop;
};

export default TopicItem;
