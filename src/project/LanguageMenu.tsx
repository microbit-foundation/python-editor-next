/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Portal,
  ThemeTypings,
  ThemingProps,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { RiEarthLine, RiExternalLinkLine } from "react-icons/ri";
import { supportedLanguages } from "../settings/settings";
import { deployment } from "../deployment";
import { FormattedMessage } from "react-intl";
import { useSettings } from "../settings/settings";

interface LanguageMenuProps extends ThemingProps<"Menu"> {
  size?: ThemeTypings["components"]["Button"]["sizes"];
}

/**
 * An icon button that triggers a drop-down menu to switch language.
 *
 * This is just a placeholder for now.
 */
const LanguageMenu = ({ size, ...props }: LanguageMenuProps) => {
  const [settings, setSettings] = useSettings();
  const handleChangeLanguage = useCallback(
    (languageId: string | string[]) => {
      if (typeof languageId !== "string") {
        throw new Error("Unexpected change type for radio group.");
      }
      setSettings({
        ...settings,
        languageId,
      });
    },
    [settings, setSettings]
  );
  return (
    <Menu {...props}>
      <MenuButton
        as={IconButton}
        aria-label="Change language"
        size={size}
        variant="sidebar"
        icon={<RiEarthLine />}
        colorScheme="gray"
        isRound
      />
      <Portal>
        <MenuList>
          <MenuOptionGroup
            value={settings.languageId}
            type="radio"
            onChange={handleChangeLanguage}
          >
            {supportedLanguages.map((language) => (
              <MenuItemOption key={language.id} value={language.id}>
                {language.name}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
          <MenuDivider />
          <MenuItem
            as="a"
            href={deployment.translationLink}
            target="_blank"
            rel="noopener"
            icon={<RiExternalLinkLine />}
          >
            <FormattedMessage id="help-translate" />
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export default LanguageMenu;
