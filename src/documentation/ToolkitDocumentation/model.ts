/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

export interface Toolkit {
  id: string;
  name: string;
  description: string;
  contents?: ToolkitTopic[];
}

export interface ToolkitTopic {
  name: string;
  /**
   * Short, for the listing.
   */
  subtitle: string;
  /**
   * Longer, for the heading above the contents.
   */
  introduction?: string;
  contents?: ToolkitTopicEntry[];
}

export interface ToolkitCode {
  _type: "python";
  main: string;
}

export interface ToolkitText {
  _type: "block";
}

export interface ToolkitImage {
  _type: "simpleImage";
  // More!
}

export type ToolkitPortableText = Array<
  ToolkitCode | ToolkitText | ToolkitImage
>;

interface ToolkitAlternative {
  name: string;
  content: ToolkitPortableText;
}

export interface ToolkitTopicEntry {
  name: string;
  content: ToolkitPortableText;
  // Should be co-present with alternatives.
  alternativesLabel?: string;
  alternatives?: ToolkitAlternative[];
  detailContent?: ToolkitPortableText;
}

export interface ToolkitNavigationState {
  topicId?: string;
  itemId?: string;
}
