import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MascotState } from "../../features/mascot";

type MascotSpeechBubbleProps = {
  message: string;
  mascotState: MascotState;
  isOffline?: boolean;
  onDismiss: () => void;
};

const STATE_LABELS: Record<MascotState, string> = {
  doente: "Yu precisa de um cuidado",
  triste: "Yu sente sua falta",
  neutro: "Yu tem uma ideia",
  feliz: "Yu esta feliz",
  animado: "Yu esta animado",
};

export function MascotSpeechBubble({
  message,
  mascotState,
  isOffline = false,
  onDismiss,
}: MascotSpeechBubbleProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.bubble}>
        <View style={styles.headerRow}>
          <Text style={styles.stateLabel}>{STATE_LABELS[mascotState]}</Text>
          {isOffline && <Text style={styles.offlineBadge}>cache</Text>}
        </View>

        <Text style={styles.message}>{message}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dispensar sugestao"
          onPress={onDismiss}
          style={({ pressed }) => [
            styles.dismissButton,
            pressed && styles.dismissButtonPressed,
          ]}
        >
          <Text style={styles.dismissText}>Dispensar</Text>
        </Pressable>
      </View>
      <View style={styles.tail} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    maxWidth: 306,
    width: "82%",
  },
  bubble: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(93,87,199,0.16)",
    borderRadius: 16,
    borderWidth: 1,
    elevation: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    shadowColor: "#2B2767",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    width: "100%",
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 6,
  },
  stateLabel: {
    color: "#5D57C7",
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  offlineBadge: {
    backgroundColor: "#F2F0FF",
    borderRadius: 999,
    color: "#5D57C7",
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  message: {
    color: "#25233A",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  dismissButton: {
    alignSelf: "flex-end",
    borderRadius: 999,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dismissButtonPressed: {
    backgroundColor: "#F2F0FF",
  },
  dismissText: {
    color: "#5D57C7",
    fontSize: 12,
    fontWeight: "800",
  },
  tail: {
    backgroundColor: "#FFFFFF",
    height: 16,
    marginTop: -8,
    transform: [{ rotate: "45deg" }],
    width: 16,
  },
});
