import { useEffect } from "react";
import { View, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";

export type MascotState =
  | "animado"
  | "feliz"
  | "neutro"
  | "cansado"
  | "triste"
  | "sem_energia"
  | "doente";

type MascotAnimationProps = {
  state: MascotState;
  size?: number;
};

const SPRITE_SIZE = 512;
const FRAME_COUNT = 10;
const FRAMES_PER_ROW = 10;
const FPS = 12;
const FRAME_DURATION = 1000 / FPS;

const SPRITESHEET = require("../../../assets/mascot/spritesheets/spritesheet_yu_sad.png");
const SHADOW = require("../../../assets/mascot/spritesheets/shadow.png");

export function MascotAnimation({ state, size = 300 }: MascotAnimationProps) {
  const frameIndex = useSharedValue(0);

  const scale = size / SPRITE_SIZE;
  const scaledSprite = SPRITE_SIZE * scale;
  const scaledSheet = SPRITE_SIZE * FRAMES_PER_ROW * scale;

  useEffect(() => {
    cancelAnimation(frameIndex);
    frameIndex.value = 0;
    frameIndex.value = withRepeat(
      withSequence(
        ...Array.from({ length: FRAME_COUNT }, (_, i) =>
          withTiming(i, {
            duration: FRAME_DURATION,
            easing: Easing.steps(1, true),
          })
        )
      ),
      -1,
      false
    );
    return () => {
      cancelAnimation(frameIndex);
    };
  }, [state]);

  const animatedSheetStyle = useAnimatedStyle(() => {
    const col = Math.floor(frameIndex.value) % FRAMES_PER_ROW;
    const row = Math.floor(Math.floor(frameIndex.value) / FRAMES_PER_ROW);
    return {
      transform: [
        { translateX: -col * scaledSprite },
        { translateY: -row * scaledSprite },
      ],
    };
  });

  return (
    <View style={{ alignItems: "center" }}>
      <Image
        source={SHADOW}
        style={{ width: size, height: size }}
        resizeMode="stretch"
      />
      <View style={{ width: size, height: size, overflow: "hidden", marginTop: -size }}>
        <Animated.Image
          source={SPRITESHEET}
          style={[
            { width: scaledSheet, height: scaledSprite },
            animatedSheetStyle,
          ]}
          resizeMode="stretch"
        />
      </View>
    </View>
  );
}