/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { fetchContent } from "../../common/sanity";
import { flags } from "../../flags";
import { Toolkit, ToolkitTopic, ToolkitTopicEntry } from "./model";

export const fetchReferenceToolkit = async (
  languageId: string
): Promise<Toolkit> => fetchContent(languageId, toolkitQuery, adaptContent);

export const getTopicAndEntry = (
  toolkit: Toolkit,
  topicOrEntryId: string | undefined
): [ToolkitTopic | undefined, ToolkitTopicEntry | undefined] => {
  const topic = toolkit.contents?.find(
    (t) => t.slug.current === topicOrEntryId
  );
  if (topic) {
    return [topic, undefined];
  }
  const entry = toolkit.contents
    ?.flatMap((topic) => topic.contents ?? [])
    .find((entry) => entry.slug.current === topicOrEntryId);
  if (!entry) {
    return [undefined, undefined];
  }
  return [entry.parent, entry];
};

// We just slurp the whole toolkit at once.
// This is necessary for the client-side search index.
const toolkitQuery = (languageId: string): string => {
  // The flag applies to the top-level document so for now there's no support for viewing drafts further down.
  const noDraftsConstraint = flags.drafts
    ? ""
    : `&& (_id in path("drafts.**"))`;
  return `
  *[_type == "toolkit" && language == "${languageId}" && (slug.current == "explore" || slug.current == "reference") ${noDraftsConstraint}]{
    _id, id, name, description, language,
    contents[]->{
      name, slug, compatibility, subtitle, image,
      introduction[] {
        ...,
        markDefs[]{
          ...,
          _type == "toolkitInternalLink" => {
            "slug": @.reference->slug,
            "targetType": @.reference->_type
          }
        }
      },
      contents[]->{
        name, slug, compatibility, 
        content[] {
          ...,
          markDefs[]{
            ...,
            _type == "toolkitInternalLink" => {
              "slug": @.reference->slug,
              "targetType": @.reference->_type
            }
          }
        },
        alternativesLabel, alternatives, 
        detailContent[] {
          ...,
          markDefs[]{
            ...,
            _type == "toolkitInternalLink" => {
              "slug": @.reference->slug,
              "targetType": @.reference->_type
            }
          }
        },
      }
    }
  }`;
};

const isDraft = (document: { _id: string }) => /^drafts\./.test(document._id);

const adaptContent = (result: any): Toolkit | undefined => {
  let toolkits = result as Toolkit[];
  if (toolkits.length === 0) {
    return undefined;
  }
  // Prefer drafts if we got both
  if (toolkits.some(isDraft)) {
    toolkits = toolkits.filter(isDraft);
  }
  if (toolkits.length > 1) {
    throw new Error("Unexpected results");
  }
  // Add topic entry parent for toolkit navigation.
  const toolkit = toolkits[0];
  toolkit.contents?.forEach((topic) => {
    topic.contents?.forEach((entry) => {
      entry.parent = topic;
    });
  });
  return toolkit;
};
