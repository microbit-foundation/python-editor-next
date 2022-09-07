import { HStack, IconButton, Select, Stack } from "@chakra-ui/react";
import { ChangeEvent, ReactNode, useCallback, useRef, useState } from "react";
import { RiSendPlane2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import { SensorStateKey, SimulatorState } from "../device/simulator";
import Axis from "./Axis";
import { RunningStatus } from "./Simulator";

interface AccelerometerModuleProps {
  icon: ReactNode;
  state: SimulatorState;
  onValueChange: (id: SensorStateKey, value: any) => void;
  minimised: boolean;
  running: RunningStatus;
}

const AccelerometerModule = ({
  icon,
  state,
  onValueChange,
  minimised,
  running,
}: AccelerometerModuleProps) => (
  <Stack spacing={5}>
    <Gesture
      icon={icon}
      enabled={running === RunningStatus.RUNNING}
      state={state}
      onValueChange={onValueChange}
    />
    {!minimised && (
      <>
        <Axis
          axis="accelerometerX"
          label="x"
          state={state}
          onValueChange={onValueChange}
        />
        <Axis
          axis="accelerometerY"
          label="y"
          state={state}
          onValueChange={onValueChange}
        />
        <Axis
          axis="accelerometerZ"
          label="z"
          state={state}
          onValueChange={onValueChange}
        />
      </>
    )}
  </Stack>
);

interface GestureProps {
  icon: ReactNode;
  state: SimulatorState;
  enabled: boolean;
  onValueChange: (id: SensorStateKey, value: any) => void;
}

const Gesture = ({ icon, state, enabled, onValueChange }: GestureProps) => {
  const sensor = state.gesture;
  if (sensor.type !== "enum") {
    throw new Error("Unexpected sensor type");
  }
  // We omit "none" as we flip from "none" to the choice and back to "none".
  const choices = sensor.choices.filter((x) => x !== "none");
  const [choice, setChoice] = useState("shake");
  const [active, setActive] = useState(false);
  const intl = useIntl();
  const ref = useRef<HTMLButtonElement>(null);

  const handleSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setChoice(e.currentTarget.value);
    },
    [setChoice]
  );
  const handleClick = useCallback(() => {
    setActive(true);
    onValueChange("gesture", choice);
    setTimeout(() => {
      setActive(false);
      onValueChange("gesture", "none");
      ref.current!.focus();
    }, 500);
  }, [setActive, onValueChange, choice]);

  return (
    <HStack spacing={3}>
      {icon}
      <Select
        data-testid="simulator-gesture-select"
        aria-label={intl.formatMessage({ id: "simulator-gesture-select" })}
        value={choice}
        onChange={handleSelectChange}
      >
        {choices.map((choice) => (
          <option key={choice} value={choice}>
            {choice}
          </option>
        ))}
      </Select>
      <IconButton
        ref={ref}
        icon={<RiSendPlane2Line />}
        disabled={!enabled || active}
        onClick={handleClick}
        aria-label={intl.formatMessage({ id: "simulator-gesture-send" })}
      ></IconButton>
    </HStack>
  );
};

export default AccelerometerModule;
