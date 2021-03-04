import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  List,
  ListItem,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { MdDragHandle } from "react-icons/md";

/**
 * The packages section showing available API.
 *
 * This is just illustrative of what we want in this area.
 */
const Packages = () => {
  const [addingPackage, setAddingPackage] = useState(false);
  return (
    <Flex height="100%" direction="column" justify="space-between">
      <Accordion
        height={0}
        flex="1 1 auto"
        allowMultiple
        allowToggle
        overflowY="auto"
      >
        {packages.map((pkg) => (
          <AccordionItem key={pkg.name}>
            <h2>
              <AccordionButton>
                <Box textAlign="left" fontWeight="semibold">
                  {pkg.name}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <List marginLeft={4}>
                {pkg.snippets.map((snippet) => (
                  <ListItem mb={2} key={snippet.value}>
                    <DraggableCodeSnippet pkg={pkg} value={snippet} />
                  </ListItem>
                ))}
              </List>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Flex>
  );
};

interface CodeSnippet {
  value: string;
  help: string;
}

interface Package {
  name: string;
  snippets: CodeSnippet[];
}

const packages: Package[] = [
  {
    name: "accelerometer",
    snippets: [
      {
        value: "get_x()",
        help: "Get the acceleration measurement in the x axis",
      },
      {
        value: "get_y()",
        help: "Get the acceleration measurement in the y axis",
      },
      {
        value: "get_z()",
        help: "Get the acceleration measurement in the z axis",
      },
    ],
  },
];

interface DraggableCodeSnippetProps {
  pkg: Package;
  value: CodeSnippet;
}

const DraggableCodeSnippet = ({
  pkg,
  value: { value, help },
}: DraggableCodeSnippetProps) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // We probably want to set some other content type that we can handle
    // specially inside the editor.
    e.dataTransfer.setData("text", `${pkg.name}.${value}`);
  };
  return (
    <HStack
      backgroundColor="whitesmoke"
      rounded="lg"
      draggable
      pt={1}
      pb={1}
      pl={2}
      pr={2}
      align="center"
      justify="space-between"
      onDragStart={handleDragStart}
      _hover={{ cursor: "grab" }}
    >
      <VStack align="flex-start">
        <Text fontWeight="semibold">{value}</Text>
        <Text>{help}</Text>
      </VStack>
      <Icon as={MdDragHandle} transform="rotate(90deg)" />
    </HStack>
  );
};

export default Packages;
