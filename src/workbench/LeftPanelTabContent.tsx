import { Box, Flex, Text } from "@chakra-ui/react";
import React, { ReactNode } from "react";

interface LeftPanelTabContentProps {
  title: string;
  children: ReactNode;
}

const LeftPanelTabContent = ({ title, children }: LeftPanelTabContentProps) => {
  return (
    <Flex height="100%" direction="column" justifyContent="space-between">
      <Text flex="0 0 auto" as="h3" fontSize="lg" fontWeight="bold" p="9px">
        {title}
      </Text>
      <Box flex="1 0 auto">{children}</Box>
    </Flex>
  );
};

export default LeftPanelTabContent;
