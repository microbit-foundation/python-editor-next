/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Search, SearchableContent, buildSearchIndex } from "./search-hooks";

const searchableExploreContent: SearchableContent[] = [
  {
    id: "indentations",
    title: "Indentations",
    containerTitle: "Loops",
    content:
      "Python uses indentations, usually 4 spaces, to show which instructions are inside and outside a loop.\n\nThis program uses a for loop to scroll 'micro:bit' on the LED display 3 times.",
  },
  {
    id: "while-loops-infinite",
    title: "While loops: infinite",
    containerTitle: "Loops",
    content:
      "Programs often use infinite loops to keep a program running.\n\nHere the word 'micro:bit' will scroll across the LED display for ever:\n\nThis is a common way to continuously check inputs like sensor readings or if a button has been pressed:\n\n",
  },
  {
    id: "while-loops-conditional",
    title: "While loops: conditional",
    containerTitle: "Loops",
    content:
      "While loops keep a block of code running as long as something is true.\n\nAny instructions after the while statement that are indented are included in the loop.\n\nThis loop keeps running while the variable number has a value less than 10. When the value reaches 10, the loop ends, so it will count from 0 to 9:\n\n",
  },
];

describe("Search", () => {
  const search = buildSearchIndex(searchableExploreContent, "explore");

  it("finds stuff", () => {
    expect(search.search("python")).toEqual([
      {
        title: "Indentations",
        containerTitle: "Loops",
        id: "indentations",
        navigation: {
          tab: "explore",
          explore: "indentations",
        },
      },
    ]);
  });

  it("returns useful position info at a low-level", () => {
    // Temporary debug of position information.
    const results = search.index.search("loops");
    expect(results).toEqual([
      {
        ref: "while-loops-conditional",
        score: 0.616,
        matchData: {
          metadata: {
            loop: {
              title: {
                position: [[6, 6]],
              },
              content: {
                position: [
                  [6, 5],
                  [153, 5],
                  [165, 4],
                  [267, 4],
                ],
              },
            },
          },
        },
      },
      {
        ref: "while-loops-infinite",
        score: 0.471,
        matchData: {
          metadata: {
            loop: {
              title: {
                position: [[6, 6]],
              },
              content: {
                position: [[28, 5]],
              },
            },
          },
        },
      },
      {
        ref: "indentations",
        score: 0.347,
        matchData: {
          metadata: {
            loop: {
              content: {
                position: [
                  [96, 5],
                  [127, 4],
                ],
              },
            },
          },
        },
      },
    ]);
  });
});
