import React, { useState } from "react";
import {
  BottomResizable,
  Fill,
  LeftResizable,
  RightResizable,
  Top,
  ViewPort,
} from "react-spaces";
import GradientLine from "../common/GradientLine";
import Placeholder from "../common/Placeholder";
import EditorContainer from "../editor/EditorContainer";
import { MAIN_FILE } from "../fs/fs";
import Header from "./Header";
import LeftPanel from "./LeftPanel";
import Simulator from "./Simulator";

const Workbench = () => {
  const [filename, setFilename] = useState(MAIN_FILE);
  return (
    // https://github.com/aeagle/react-spaces
    <ViewPort>
      <Top size={65}>
        <Header />
        <GradientLine />
      </Top>
      <Fill>
        <LeftResizable
          size="25%"
          minimumSize={210}
          style={{ borderRight: "4px solid whitesmoke" }}
        >
          <LeftPanel onSelectedFileChanged={setFilename} />
        </LeftResizable>
        <Fill>
          <Fill>
            <Fill>
              <EditorContainer
                key={filename}
                filename={filename}
                onSelectedFileChanged={setFilename}
              />
            </Fill>
            <RightResizable
              size="30%"
              style={{ borderLeft: "4px solid whitesmoke" }}
            >
              <Simulator />
            </RightResizable>
          </Fill>
          <BottomResizable size="25%">
            <Placeholder
              bgColor="blackAlpha.900"
              color="white"
              text="Serial here, showing errors from your micro:bit when you run the code"
            />
          </BottomResizable>
        </Fill>
      </Fill>
    </ViewPort>
  );
};

export default Workbench;
