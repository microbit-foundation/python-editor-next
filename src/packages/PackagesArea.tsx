/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  List,
  ListItem,
} from "@chakra-ui/react";
import DraggableCodeSnippet from "./DraggableCodeSnippet";
import { packages } from "./packages";

/**
 * The packages section showing available API.
 *
 * This is just illustrative of what we want in this area.
 */
const PackagesArea = () => {
  return (
    <Accordion flex="1 1 auto" allowMultiple allowToggle height="100%">
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
  );
};

export default PackagesArea;
