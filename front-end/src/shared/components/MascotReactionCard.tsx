import { useEffect } from "react";
import { View, Text, StyleSheet, Modal, Pressable, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import type { MascotReaction } from "../../features/mascot/MascotReactionTypes";

const REACTION_CONFIG: Record<MascotReaction, { text: string; image: ReturnType<typeof require> }> = {
  primeiro_goal: {
    text: "Primeiro goal do dia!\nContinue assim",
    image: require("../../../assets/mascot/icons/icon_yu_happy.png"),
  },
  ultimo_goal: {
    text: "Meta do dia concluída!\nYu está orgulhoso",
    image: require("../../../assets/mascot/icons/icon_yu_happy.png"),
  },
};

const AUTO_DISMISS_DELAY = 3000;

type MascotReactionCardProps = {
  reaction: MascotReaction | null;
  onDismiss: () => void;
};

export function MascotReactionCard({ reaction, onDismiss }: MascotReactionCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);

  useEffect(() => {
    if (!reaction) return;

    opacity.value = 0;
    translateY.value = 40;

    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
    translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) runOnJS(onDismiss)();
      });
      translateY.value = withTiming(40, { duration: 300 });
    }, AUTO_DISMISS_DELAY);

    return () => clearTimeout(timer);
  }, [reaction]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!reaction) return null;

  const { text, image } = REACTION_CONFIG[reaction];

  return (
    <Modal transparent animationType="none" visible={!!reaction}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Image
            source={image}
            style={styles.mascotImage}
            resizeMode="contain"
          />
          <Text style={styles.text}>{text}</Text>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 40,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: "center",
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  mascotImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5d57c7",
    textAlign: "center",
    lineHeight: 26,
  },
});