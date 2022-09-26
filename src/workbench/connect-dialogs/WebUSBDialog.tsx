/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Flex, HStack, Image, Text, VStack } from "@chakra-ui/react";
import { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { GenericDialog } from "../../common/GenericDialog";
import chromeOSErrorImage from "./chrome-os-105-error.png";

interface WebUSBDialogProps {
  callback: () => void;
  finalFocusRef: React.RefObject<HTMLButtonElement>;
  chromeOS105Error: boolean;
}

export const WebUSBDialog = ({
  callback,
  finalFocusRef,
  chromeOS105Error,
}: WebUSBDialogProps) => {
  const handleClose = useCallback(() => {
    callback();
  }, [callback]);
  return (
    <GenericDialog
      finalFocusRef={finalFocusRef}
      onClose={handleClose}
      body={<WebUSBDialogBody chromeOS105Error={chromeOS105Error} />}
      footer={<WebUSBDialogFooter onCancel={handleClose} />}
      size="3xl"
    />
  );
};

interface WebUSBDialogBodyProps {
  chromeOS105Error: boolean;
}

const WebUSBDialogBody = ({ chromeOS105Error }: WebUSBDialogBodyProps) => {
  return (
    <VStack
      width="auto"
      ml="auto"
      mr="auto"
      p={8}
      pb={0}
      spacing={5}
      alignItems="flex-start"
    >
      <Text as="h2" fontSize="xl" fontWeight="semibold">
        <FormattedMessage id="webusb-not-supported-title" />
      </Text>
      {chromeOS105Error ? (
        <>
          <Text>There is an issue with Chrome OS version 105 and WebUSB*</Text>
          <Text>
            Unfortunately “Send to micro:bit” does not work in this particular
            Chrome OS version due to a bug in the operating system. The next
            version of Chrome OS, version 106, expected October 2022, should
            contain a fix for this.
          </Text>
          <Text>
            Your program will be saved to your computer instead. Follow the
            steps on the next screen to transfer it to your micro:bit.
          </Text>
          <Text>
            *<FormattedMessage id="webusb-why-use" />
          </Text>
          <Flex justifyContent="center" width="100%">
            <Image width="100%" height="100%" src={chromeOSErrorImage} alt="" />
          </Flex>
        </>
      ) : (
        <>
          <Text>
            <FormattedMessage id="webusb-not-supported" />
          </Text>
          <Text>
            <FormattedMessage id="webusb-why-use" />
          </Text>
        </>
      )}
    </VStack>
  );
};

interface WebUSBDialogFooterProps {
  onCancel: () => void;
}

const WebUSBDialogFooter = ({ onCancel }: WebUSBDialogFooterProps) => {
  return (
    <HStack spacing={2.5}>
      <Button onClick={onCancel} size="lg">
        <FormattedMessage id="close-action" />
      </Button>
    </HStack>
  );
};

export default WebUSBDialog;
