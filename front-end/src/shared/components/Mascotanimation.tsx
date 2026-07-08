import { useEffect } from "react";
import { View, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";



type MascotAnimationProps = {
  state: MascotState;
  size?: number;
};

const SPRITE_SIZE = 512;
const FRAME_COUNT = 10;
const FRAMES_PER_ROW = 10;
const FPS = 16;
const TOTAL_DURATION = (1000 / FPS) * FRAME_COUNT;

export type MascotState = "doente" | "triste" | "neutro" | "feliz" | "animado";

const SPRITESHEETS: Record<MascotState, ReturnType<typeof require>> = {
  doente:  require("../../../assets/mascot/spritesheets/spritesheet_yu_doente.png"),
  triste:  require("../../../assets/mascot/spritesheets/spritesheet_yu_sad.png"),
  neutro:  require("../../../assets/mascot/spritesheets/spritesheet_yu_neutro.png"),
  feliz:   require("../../../assets/mascot/spritesheets/spritesheet_yu_happy.png"),
  animado: require("../../../assets/mascot/spritesheets/spritesheet_yu_animado.png"),
};
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
      withTiming(FRAME_COUNT, {
        duration: TOTAL_DURATION,
        easing: Easing.steps(FRAME_COUNT, false),
      }),
      -1,
      false
    );
    return () => {
      cancelAnimation(frameIndex);
    };
  }, [state]);

  const animatedSheetStyle = useAnimatedStyle(() => {
    const frame = Math.floor(frameIndex.value) % FRAME_COUNT;
    const col = frame % FRAMES_PER_ROW;
    const row = Math.floor(frame / FRAMES_PER_ROW);
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
          source={SPRITESHEETS[state]}
          style={[
            { width: scaledSheet, height: scaledSprite },
            animatedSheetStyle,
          ]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}