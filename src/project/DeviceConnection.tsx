import {
  ButtonGroup,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Switch,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { MdMoreVert } from "react-icons/md";
import { RiDownload2Line, RiFlashlightFill } from "react-icons/ri";
import { ConnectionStatus } from "../device/device";
import { useConnectionStatus } from "../device/device-hooks";
import DownloadButton from "./DownloadButton";
import FlashButton from "./FlashButton";
import { useProjectActions } from "./project-hooks";

/**
 * The device connection area.
 *
 * It shows the current connection status and allows the user to
 * flash (if WebUSB is supported) or otherwise just download a HEX.
 */
const DeviceConnection = () => {
  const connectionStatus = useConnectionStatus();
  const connected = connectionStatus === ConnectionStatus.CONNECTED;
  const actions = useProjectActions();
  const handleToggleConnected = useCallback(async () => {
    if (connected) {
      await actions.disconnect();
    } else {
      await actions.connect();
    }
  }, [connected, actions]);
  const buttonWidth = "10rem";
  return (
    <HStack>
      <HStack>
        <Menu>
          <ButtonGroup isAttached>
            {connected ? (
              <FlashButton
                width={buttonWidth}
                mode={"button"}
                size="lg"
                colorScheme="blue"
              />
            ) : (
              <DownloadButton
                width={buttonWidth}
                mode={"button"}
                size="lg"
                colorScheme="blue"
              />
            )}
            <MenuButton
              borderLeft="1px"
              borderColor="gray.200"
              as={IconButton}
              icon={<MdMoreVert />}
              size="lg"
              colorScheme="blue"
            />
            <Portal>
              <MenuList>
                {!connected && (
                  <MenuItem
                    target="_blank"
                    rel="noopener"
                    icon={<RiFlashlightFill />}
                    onClick={actions.flash}
                  >
                    Flash
                  </MenuItem>
                )}
                {connected && (
                  <MenuItem
                    target="_blank"
                    rel="noopener"
                    icon={<RiDownload2Line />}
                    onClick={actions.download}
                  >
                    Download project hex
                  </MenuItem>
                )}
                <MenuItem
                  target="_blank"
                  rel="noopener"
                  icon={<RiDownload2Line />}
                  onClick={actions.downloadMainFile}
                >
                  Download Python script
                </MenuItem>
              </MenuList>
            </Portal>
          </ButtonGroup>
        </Menu>
      </HStack>
      <HStack as="label" spacing={3} width="14rem">
        <Tooltip text="Connect to your micro:bit over WebUSB">
          <Switch
            isChecked={connected}
            onChange={handleToggleConnected}
            colorScheme="blue"
          />
        </Tooltip>
        <Text as="span" size="lg" fontWeight="semibold">
          {connected ? "micro:bit connected" : "micro:bit disconnected"}
        </Text>
      </HStack>
    </HStack>
  );
};

export default DeviceConnection;
