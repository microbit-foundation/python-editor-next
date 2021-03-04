import {
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
  Text,
  ThemeTypings,
  ThemingProps,
} from "@chakra-ui/react";
import React, { useCallback } from "react";
import {
  RiExternalLinkLine,
  RiFileCopy2Line,
  RiQuestionLine,
} from "react-icons/ri";
import Separate from "../common/Separate";
import useActionFeedback, {
  ActionFeedback,
} from "../common/use-action-feedback";
import config from "../config";
import { microPythonVersions } from "../fs/fs";

interface HelpMenuProps extends ThemingProps<"Menu"> {
  size?: ThemeTypings["components"]["Button"]["sizes"];
}

export const versionInfo = [
  `Editor ${process.env.REACT_APP_VERSION}`,
  `MicroPython ${microPythonVersions.map((mpy) => mpy.version).join("/")}`,
];

const openInNewTab = (href: string) => () =>
  window.open(href, "_blank", "noopener");

// Exported for now so we can share them in alt-layouts.
export const handleDocumentation = openInNewTab(config.documentationLink);
export const handleSupport = openInNewTab(config.supportLink);
export const copyVersion = async (actionFeedback: ActionFeedback) => {
  try {
    await navigator.clipboard.writeText(versionInfo.join("\n"));
  } catch (e) {
    actionFeedback.unexpectedError(e);
  }
};

const HelpMenu = ({ size, ...props }: HelpMenuProps) => {
  const actionFeedback = useActionFeedback();
  const handleCopyVersion = useCallback(async () => {
    copyVersion(actionFeedback);
  }, [actionFeedback]);

  // TODO: Can we make these actual links and still use the menu components?
  return (
    <Menu {...props}>
      <MenuButton
        as={IconButton}
        aria-label="Help"
        size={size}
        variant="ghost"
        icon={<RiQuestionLine />}
        isRound
      />
      <Portal>
        <MenuList>
          <MenuItem onClick={handleDocumentation} icon={<RiExternalLinkLine />}>
            Documentation
          </MenuItem>
          <MenuItem onClick={handleSupport} icon={<RiExternalLinkLine />}>
            Support
          </MenuItem>
          <MenuDivider />
          {/* shift the icon to align with the first line of content */}
          <MenuItem
            icon={<RiFileCopy2Line style={{ marginTop: "0.5rem" }} />}
            alignItems="top"
            onClick={handleCopyVersion}
          >
            Copy version to clipboard
            <br />
            <Text as="span" fontSize="xs">
              <Separate separator={(key) => <br key={key} />}>
                {versionInfo}
              </Separate>
            </Text>
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export default HelpMenu;
