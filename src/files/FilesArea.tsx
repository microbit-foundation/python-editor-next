import { Center, List, ListItem, VStack } from "@chakra-ui/react";
import OpenButton from "../project/OpenButton";
import { useProject } from "../project/project-hooks";
import { isEditableFile } from "../project/project-utils";
import FileRow from "./FileRow";

interface FilesProps {
  selectedFile: string | undefined;
  onSelectedFileChanged: (name: string) => void;
}

/**
 * The main files area, offering access to individual files.
 */
const FilesArea = ({ selectedFile, onSelectedFileChanged }: FilesProps) => {
  const { files, name: projectName } = useProject();
  return (
    <VStack alignItems="stretch" spacing={5} height="100%">
      <List flexGrow={1}>
        {files.map((f) => {
          const select = () => {
            if (isEditableFile(f.name)) {
              onSelectedFileChanged(f.name);
            }
          };
          return (
            <ListItem
              key={f.name}
              backgroundColor={selectedFile === f.name ? "blue.50" : undefined}
              pl={2}
              onClick={select}
              pr={1}
              cursor="pointer"
            >
              <FileRow
                height={12}
                value={f}
                projectName={projectName}
                onEdit={select}
              />
            </ListItem>
          );
        })}
      </List>
      <Center p={2}>
        <OpenButton mode="button" size="lg" />
      </Center>
    </VStack>
  );
};

export default FilesArea;
