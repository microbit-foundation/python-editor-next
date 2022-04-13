/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Stack } from "@chakra-ui/layout";
import { Image, SimpleGrid } from "@chakra-ui/react";
import { useCallback, useRef } from "react";
import { useIntl } from "react-intl";
import AreaHeading from "../../common/AreaHeading";
import HeadedScrollablePanel from "../../common/HeadedScrollablePanel";
import { imageUrlBuilder, getAspectRatio } from "../../common/imageUrlBuilder";
import { useResizeObserverContentRect } from "../../common/use-resize-observer";
import { flags } from "../../flags";
import { Anchor, RouterParam, useRouterParam } from "../../router-hooks";
import { useAnimationDirection } from "../common/documentation-animation-hooks";
import DocumentationBreadcrumbHeading from "../common/DocumentationBreadcrumbHeading";
import DocumentationContent from "../common/DocumentationContent";
import { isV2Only } from "../common/model";
import IdeaCard from "./IdeaCard";
import { Idea } from "./model";

interface IdeasDocumentationProps {
  ideas: Idea[];
}

const IdeasDocumentation = ({ ideas }: IdeasDocumentationProps) => {
  const [anchor, setAnchor] = useRouterParam(RouterParam.idea);
  const direction = useAnimationDirection(anchor);
  const ideaId = anchor?.id;
  const handleNavigate = useCallback(
    (ideaId: string | undefined) => {
      setAnchor(ideaId ? { id: ideaId } : undefined, "documentation-user");
    },
    [setAnchor]
  );
  return (
    <ActiveLevel
      key={anchor ? 0 : 1}
      anchor={anchor}
      ideaId={ideaId}
      onNavigate={handleNavigate}
      ideas={ideas}
      direction={direction}
    />
  );
};

interface ActiveLevelProps extends IdeasDocumentationProps {
  anchor: Anchor | undefined;
  ideaId: string | undefined;
  onNavigate: (ideaId: string | undefined) => void;
  direction: "forward" | "back" | "none";
}

const ActiveLevel = ({
  ideaId,
  onNavigate,
  ideas,
  direction,
}: ActiveLevelProps) => {
  const activeIdea = ideas.find((idea) => idea.slug.current === ideaId);
  const intl = useIntl();
  const headingString = intl.formatMessage({ id: "ideas-tab" });
  const ref = useRef<HTMLDivElement>(null);
  const contentRect = useResizeObserverContentRect(ref);
  const contentWidth = contentRect?.width ?? 0;
  const numCols =
    !contentWidth || contentWidth > 1100 ? 3 : contentWidth > 550 ? 2 : 1;
  if (activeIdea && flags.ideas) {
    return (
      <HeadedScrollablePanel
        key={activeIdea.slug.current}
        direction={direction}
        heading={
          <DocumentationBreadcrumbHeading
            parent={headingString}
            title={activeIdea.name}
            onBack={() => onNavigate(undefined)}
          />
        }
      >
        {activeIdea.content && (
          <Stack spacing={3} fontSize="sm" p={5} pr={3} mt={1} mb={1}>
            {activeIdea.image && (
              <Image
                borderRadius="lg"
                src={imageUrlBuilder
                  .image(activeIdea.image.asset)
                  .fit("max")
                  .url()}
                alt=""
                maxWidth={800}
                width="100%"
                sx={{
                  aspectRatio: getAspectRatio(activeIdea.image.asset._ref),
                }}
              />
            )}

            <DocumentationContent content={activeIdea.content} />
          </Stack>
        )}
      </HeadedScrollablePanel>
    );
  }
  return (
    <HeadedScrollablePanel
      direction={direction}
      heading={
        <AreaHeading
          name={headingString}
          description={intl.formatMessage({ id: "ideas-tab-description" })}
        />
      }
    >
      {flags.ideas && (
        <SimpleGrid columns={numCols} spacing={5} p={5} ref={ref}>
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.name}
              name={idea.name}
              isV2Only={isV2Only(idea)}
              image={idea.image}
              onClick={() => onNavigate(idea.slug.current)}
            />
          ))}
        </SimpleGrid>
      )}
    </HeadedScrollablePanel>
  );
};

export default IdeasDocumentation;
