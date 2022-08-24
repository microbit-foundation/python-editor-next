/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { HStack, Text, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { SimulatorState } from "../device/simulator";
import SensorInput from "./SensorInput";
import { RunningStatus } from "./Simulator";

interface ButtonsModuleProps {
  icon: ReactNode;
  state: SimulatorState;
  onValueChange: (id: string, value: any) => void;
  running: RunningStatus;
  minimised: boolean;
}

const ButtonsModule = ({
  icon,
  state: state,
  onValueChange,
  running,
  minimised,
}: ButtonsModuleProps) => {
  return (
    <HStack spacing={3}>
      <VStack spacing={3} alignItems="flex-start">
        {minimised ? (
          icon
        ) : (
          <>
            <Text height={8} alignItems="center" display="flex">
              <FormattedMessage id="simulator-input-press" />
            </Text>
            <Text>
              <FormattedMessage id="simulator-input-hold" />
            </Text>
          </>
        )}
      </VStack>
      <SensorInput
        type="button"
        sensorId="buttonA"
        label="A"
        state={state}
        onValueChange={onValueChange}
        running={running}
        minimised={minimised}
      />
      <SensorInput
        type="button"
        sensorId="buttonB"
        label="B"
        state={state}
        onValueChange={onValueChange}
        running={running}
        minimised={minimised}
      />
    </HStack>
  );
};

export default ButtonsModule;
