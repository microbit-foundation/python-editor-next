import {
  AspectRatio,
  Box,
  BoxProps,
  HStack,
  Icon,
  IconButton,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconType } from "react-icons";
import {
  RiPlayFill,
  RiQuestionFill,
  RiStopFill,
  RiSunFill,
  RiTempHotFill,
} from "react-icons/ri";
import { useFileSystem } from "../fs/fs-hooks";

interface Sensor {
  type: "range";
  id: string;
  min: number;
  max: number;
  value: number;
  unit?: string;
}

const useSimulator = (ref: React.RefObject<HTMLIFrameElement>) => {
  const fs = useFileSystem();
  const [sensors, setSensors] = useState<Record<string, Sensor>>({});
  const readyCallbacks = useRef([] as Array<() => void>);
  useEffect(() => {
    if (ref.current) {
      const messageListener = (e: MessageEvent) => {
        const simulator = ref.current!.contentWindow;
        if (e.source === simulator) {
          switch (e.data.kind) {
            case "ready": {
              setSensors(
                Object.fromEntries(
                  e.data.sensors.map((json: Sensor) => {
                    return [json.id, json];
                  })
                )
              );
              while (readyCallbacks.current.length) {
                readyCallbacks.current.pop()!();
              }
              break;
            }
            case "serial_output": {
              // TODO: serial
              break;
            }
          }
        }
      };
      window.addEventListener("message", messageListener);
      return () => {
        window.removeEventListener("message", messageListener);
      };
    }
  }, [ref, readyCallbacks]);

  const onSensorChange = useCallback(
    (id: string, value: number) => {
      setSensors((sensors) => ({
        ...sensors,
        [id]: { ...sensors[id], value },
      }));
      const simulator = ref.current!.contentWindow!;
      simulator.postMessage(
        {
          kind: "sensor_set",
          sensor: id,
          value,
        },
        "*"
      );
    },
    [ref, setSensors]
  );

  const play = useCallback(async () => {
    const filesystem: Record<string, Uint8Array> = Object.fromEntries(
      await Promise.all(
        fs.project.files.map(async (f) => [
          f.name,
          (await fs.read(f.name)).data,
        ])
      )
    );
    const simulator = ref.current!.contentWindow!;
    simulator.postMessage(
      {
        kind: "flash",
        filesystem,
      },
      "*"
    );
  }, [ref, fs]);

  const stop = useCallback(async () => {
    const simulator = ref.current!.contentWindow!;
    simulator.postMessage(
      {
        kind: "serial_input",
        // Ctrl-C to interrupt.
        // A specific message would be useful as probably best to clear display etc. here.
        data: `\x03`,
      },
      "*"
    );
  }, [ref]);

  return {
    play,
    stop,
    sensors: Object.values(sensors),
    onSensorChange,
  };
};

const Simulator = () => {
  const ref = useRef<HTMLIFrameElement>(null);
  const { play, stop, sensors, onSensorChange } = useSimulator(ref);
  return (
    <VStack spacing={5}>
      <Box width="100%">
        <AspectRatio ratio={400 / 321} width="100%">
          <Box
            ref={ref}
            as="iframe"
            // Very much a temporary / unsupported deployment!
            src="https://stage-python-simulator.microbit.org/simulator.html"
            title="Simulator"
            frameBorder="no"
            scrolling="no"
          />
        </AspectRatio>
        {/* Margin hack until we remove space from iframe */}
        <HStack justifyContent="center" mt={-2}>
          <IconButton
            variant="solid"
            onClick={play}
            icon={<RiPlayFill />}
            aria-label="Run"
          />
          <IconButton
            variant="outline"
            onClick={stop}
            icon={<RiStopFill />}
            aria-label="Stop"
          />
        </HStack>
      </Box>
      <Sensors
        value={sensors}
        flex="1 1 auto"
        onSensorChange={onSensorChange}
      />
    </VStack>
  );
};

interface SensorsProps extends BoxProps {
  value: Sensor[];
  onSensorChange: (id: string, value: number) => void;
}

const Sensors = ({ value, onSensorChange, ...props }: SensorsProps) => {
  return (
    <Stack {...props} height="100%" width="100%" p={5} spacing={3}>
      {value.map((sensor) => {
        switch (sensor.type) {
          case "range":
            return (
              <RangeSensor
                key={sensor.id}
                value={sensor}
                onSensorChange={onSensorChange}
              />
            );
          default:
            return null;
        }
      })}
    </Stack>
  );
};

interface RangeSensorProps {
  value: Sensor;
  onSensorChange: (id: string, value: number) => void;
}

const icons: Record<string, IconType> = {
  temperature: RiTempHotFill,
  lightLevel: RiSunFill,
};

const RangeSensor = ({
  value: { id, min, max, value, unit },
  onSensorChange,
}: RangeSensorProps) => {
  const handleChange = useCallback(
    (value: number) => {
      onSensorChange(id, value);
    },
    [onSensorChange, id]
  );
  const valueText = unit ? `${value} ${unit}` : value.toString();
  return (
    <HStack pt={5}>
      <Icon
        as={icons[id] || RiQuestionFill}
        aria-label={id}
        color="blimpTeal.400"
        boxSize="6"
      />
      <Slider
        aria-label={id}
        value={value}
        min={min}
        max={max}
        onChange={handleChange}
        my={5}
      >
        <SliderTrack>
          <SliderFilledTrack bgColor="blimpTeal.600" />
        </SliderTrack>
        <SliderThumb />
        <SliderMark value={min} mt="1" fontSize="xs">
          {min}
        </SliderMark>
        <SliderMark value={max} mt="1" ml="-3ch" fontSize="xs">
          {max}
        </SliderMark>
        <SliderMark
          value={value}
          textAlign="center"
          mt="-8"
          ml={-valueText.length / 2 + "ch"}
          fontSize="xs"
        >
          {valueText}
        </SliderMark>
      </Slider>
    </HStack>
  );
};

export default Simulator;
