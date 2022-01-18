/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, ReactNode, useContext, useMemo } from "react";
import { useToolkitState } from "./ToolkitProvider";
import lunr from "lunr";
import { ToolkitPortableText } from "./explore/model";

interface Search {
  referenceSearch(text: string): string[];
  exploreSearch(text: string): string[];
}

interface searchableContent {
  id: string;
  text: string | undefined;
}

const SearchContext = createContext<Search | undefined>(undefined);

export const useSearch = (): Search => {
  const value = useContext(SearchContext);
  if (!value) {
    throw new Error("Missing provider!");
  }
  return value;
};

const defaults = { nonTextBehavior: "remove" };

const blocksToText = (
  blocks: ToolkitPortableText | undefined,
  opts = {}
): string => {
  const options = Object.assign({}, defaults, opts);
  if (!blocks) {
    return "";
  }
  return blocks
    .map((block) => {
      if (block._type !== "block" || !block.children) {
        return options.nonTextBehavior === "remove"
          ? ""
          : `[${block._type} block]`;
      }

      return block.children.map((child: any): string => child.text).join("");
    })
    .join("\n\n");
};

const SearchProvider = ({ children }: { children: ReactNode }) => {
  const { exploreToolkit, referenceToolkit } = useToolkitState();

  const value: Search = useMemo(() => {
    const searchableReferenceContent: searchableContent[] = [];
    const searchableExploreContent: searchableContent[] = [];

    if (referenceToolkit) {
      for (const doc in referenceToolkit) {
        searchableReferenceContent.push({
          id: referenceToolkit[doc].id,
          text: referenceToolkit[doc].docString,
        });
      }
    }

    const referenceIndex = lunr(function () {
      this.ref("id");
      this.field("text");
      this.metadataWhitelist = ["position"];
      for (const doc of searchableReferenceContent) {
        this.add(doc);
      }
    });

    if (exploreToolkit.status === "ok") {
      exploreToolkit.toolkit.contents?.forEach((t) => {
        t.contents?.forEach((e) => {
          const contentString = blocksToText(e.content);
          const detailContentString = blocksToText(e.detailContent);
          searchableExploreContent.push({
            id: e.slug.current,
            text: contentString + detailContentString,
          });
        });
      });
    }

    const exploreIndex = lunr(function () {
      this.ref("id");
      this.field("text");
      this.metadataWhitelist = ["position"];
      for (const doc of searchableExploreContent) {
        this.add(doc);
      }
    });

    return {
      referenceSearch: (text: string) => {
        const results = referenceIndex.search(text);
        console.log(results);
        return results.map((r) => r.ref);
      },
      exploreSearch: (text: string) => {
        const results = exploreIndex.search(text);
        console.log(results);
        return results.map((r) => r.ref);
      },
    };
  }, [exploreToolkit, referenceToolkit]);

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

export default SearchProvider;
