/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, useContext } from "react";
import { defaultCodeFontSizePt } from "../deployment/misc";
import { stage } from "../environment";

export interface Language {
  id: string;
  name: string;
}

export const supportedLanguages = [
  {
    id: "en",
    name: "English",
  },
];
if (stage === "REVIEW" || process.env.NODE_ENV !== "production") {
  supportedLanguages.push({
    id: "lol", // This has to be a valid locale value, so can't be e.g. "test".
    name: "Translation test",
  });
}

export const minimumFontSize = 4;
export const maximumFontSize = 154;
export const fontSizeStep = 3;

export const defaultSettings: Settings = {
  languageId: supportedLanguages[0].id,
  fontSize: defaultCodeFontSizePt,
  codeStructureHighlight: "l-shape-boxes",
};

export const isValidSettingsObject = (value: unknown): value is Settings => {
  if (typeof value !== "object") {
    return false;
  }
  const object = value as any;
  if (
    object.languageId &&
    !supportedLanguages.find((x) => x.id === object.languageId)
  ) {
    return false;
  }
  return true;
};

export type CodeStructureHighlight =
  | "none"
  | "l-shapes"
  | "boxes"
  | "l-shape-boxes";

export interface Settings {
  languageId: string;
  fontSize: number;
  codeStructureHighlight: CodeStructureHighlight;
}

type SettingsContextValue = [Settings, (settings: Settings) => void];

export const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined
);

export const useSettings = (): SettingsContextValue => {
  const settings = useContext(SettingsContext);
  if (!settings) {
    throw new Error("Missing provider");
  }
  return settings;
};
