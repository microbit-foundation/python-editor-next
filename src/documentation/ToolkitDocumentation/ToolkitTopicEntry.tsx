/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, Flex, Stack, Text } from "@chakra-ui/layout";
import { Collapse, useDisclosure } from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import { ChangeEvent, useCallback, useState } from "react";
import { Anchor } from "../../router-hooks";
import ShowMoreButton from "../common/ShowMoreButton";
import {
  isV2Only,
  ToolkitTopic,
  ToolkitTopicEntry as ToolkitTopicEntryModel,
} from "./model";
import ToolkitContent from "./ToolkitContent";
import Highlight from "../ToolkitDocumentation/Highlight";

interface ToolkitTopicEntryProps extends BoxProps {
  topic: ToolkitTopic;
  entry: ToolkitTopicEntryModel;
  active?: boolean;
  anchor?: Anchor;
}

/**
 * A toolkit topic entry. Can be displayed with and without detail.
 *
 * We show a pop-up over the code on hover to reveal the full code, overlapping
 * the sidebar scroll area.
 */
const ToolkitTopicEntry = ({
  anchor,
  topic,
  entry,
  active,
  ...other
}: ToolkitTopicEntryProps) => {
  const { content, detailContent, alternatives, alternativesLabel } = entry;
  const hasDetail = !!detailContent;
  const [alternativeIndex, setAlternativeIndex] = useState<number | undefined>(
    alternatives && alternatives.length > 0 ? 0 : undefined
  );
  const handleSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setAlternativeIndex(parseInt(e.currentTarget.value, 10));
    },
    [setAlternativeIndex]
  );
  const disclosure = useDisclosure();
  return (
    <Highlight
      anchor={anchor}
      entryName={topic.name}
      active={active}
      disclosure={disclosure}
    >
      <Stack spacing={3} fontSize="sm" p={5} pr={3} mt={1} mb={1}>
        <Text as="h3" fontSize="lg" fontWeight="semibold">
          {entry.name}
          {isV2Only(entry) ? " (V2)" : ""}
        </Text>
        <ToolkitContent content={content} />
        {alternatives && typeof alternativeIndex === "number" && (
          <>
            <Flex wrap="wrap" as="label">
              <Text alignSelf="center" mr={2} as="span">
                {alternativesLabel}
              </Text>
              <Select
                w="fit-content"
                onChange={handleSelectChange}
                value={alternativeIndex}
                size="sm"
              >
                {alternatives.map((alterative, index) => (
                  <option key={alterative.name} value={index}>
                    {alterative.name}
                  </option>
                ))}
              </Select>
            </Flex>

            <ToolkitContent content={alternatives[alternativeIndex].content} />
          </>
        )}
        {hasDetail && (
          <>
            {/* Avoid Stack spacing here so the margin animates too. */}
            <Collapse in={disclosure.isOpen} style={{ marginTop: 0 }}>
              <Stack spacing={3} mt={3}>
                <ToolkitContent content={detailContent} />
              </Stack>
            </Collapse>
            <ShowMoreButton
              onClick={disclosure.onToggle}
              isOpen={disclosure.isOpen}
            />
          </>
        )}
      </Stack>
    </Highlight>
  );
};

export default ToolkitTopicEntry;
