import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { MascotAnimation } from "../../../shared/components/Mascotanimation";
import type { MascotEvent } from "../mascotEvents";
import {
  getMascotStateWithOfflineFallback,
  resolveAndPersistMascotState,
} from "../mascotStateStorage";
import type { MascotContext, MascotState } from "../mascotTypes";

type MascoteProps = {
  context: MascotContext | null;
  event?: MascotEvent | null;
  size?: number;
  onStateChange?: (state: MascotState) => void;
};

export function Mascote({
  context,
  event = null,
  size = 340,
  onStateChange,
}: MascoteProps) {
  const [currentState, setCurrentState] = useState<MascotState>("neutro");
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    let isActive = true;

    async function updateMascotState() {
      const nextState =
        context && context.isOffline !== true
          ? await resolveAndPersistMascotState(context)
          : await getMascotStateWithOfflineFallback(null);

      if (isActive) {
        setCurrentState(nextState);
        onStateChange?.(nextState);
      }
    }

    updateMascotState();

    return () => {
      isActive = false;
    };
  }, [context, onStateChange]);

  useEffect(() => {
    cancelAnimation(opacity);
    cancelAnimation(scale);
    cancelAnimation(translateY);

    opacity.value = 0.7;
    scale.value = 0.96;
    translateY.value = 4;

    opacity.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
    translateY.value = withTiming(0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [currentState, opacity, scale, translateY]);

  useEffect(() => {
    const eventType = event?.type;

    if (!eventType) {
      return;
    }

    cancelAnimation(scale);
    cancelAnimation(translateX);
    cancelAnimation(translateY);

    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;

    if (eventType === "metaCumprida") {
      scale.value = withSequence(
        withTiming(1.12, {
          duration: 140,
          easing: Easing.out(Easing.quad),
        }),
        withSpring(1, {
          damping: 8,
          stiffness: 180,
        })
      );
      return;
    }

    if (eventType === "sugestaoIgnorada") {
      translateX.value = withSequence(
        withTiming(-8, { duration: 55 }),
        withTiming(8, { duration: 55 }),
        withTiming(-6, { duration: 55 }),
        withTiming(6, { duration: 55 }),
        withTiming(0, { duration: 70 })
      );
      return;
    }

    if (eventType === "streakQuebrada") {
      scale.value = withSequence(
        withTiming(0.92, {
          duration: 130,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(1, {
          duration: 180,
          easing: Easing.out(Easing.cubic),
        })
      );
      translateY.value = withSequence(
        withTiming(10, {
          duration: 130,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(0, {
          duration: 180,
          easing: Easing.out(Easing.cubic),
        })
      );
      return;
    }

    scale.value = withSequence(
      withTiming(1.18, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      }),
      withSpring(1, {
        damping: 6,
        stiffness: 190,
      })
    );
    translateY.value = withSequence(
      withTiming(-12, {
        duration: 120,
        easing: Easing.out(Easing.quad),
      }),
      withSpring(0, {
        damping: 7,
        stiffness: 180,
      })
    );
  }, [event?.createdAt, event?.id, event?.type, scale, translateX, translateY]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <MascotAnimation state={currentState} size={size} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
