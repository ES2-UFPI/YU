import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { useRef, useState } from "react";
import * as Haptics from "expo-haptics";

type GoalCheckCardProps = {
    title: string;
    description: string;
    iconColor?: string;
    iconSize?: number;
    cardSize?: number;
    onCompleteBackend?: () => Promise<void>;
};

const HOLD_DURATION = 2000;

export const GoalCheckCard = ({
    title,
    description,
    iconColor = "#d2d2d2",
    iconSize = 56,
    cardSize = 100,
    onCompleteBackend,
}: GoalCheckCardProps) => {
    const [status, setStatus] = useState<"idle" | "holding" | "done">("idle");
    const [showDescription, setShowDescription] = useState(false);

    const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const progressAnimation = useRef<Animated.CompositeAnimation | null>(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const isDone = status === "done";

    const handlePressIn = () => {
        if (isDone) return;

        holdTimer.current = setTimeout(() => {
            setStatus("holding");
            setShowDescription(false);

            Animated.spring(scaleAnim, {
                toValue: 0.97,
                useNativeDriver: true,
                speed: 50,
                bounciness: 4,
            }).start();

            progressAnimation.current = Animated.timing(progressAnim, {
                toValue: 1,
                duration: HOLD_DURATION,
                useNativeDriver: false,
            });
            progressAnimation.current.start();

            holdTimer.current = setTimeout(async () => {
                try {
                    await onCompleteBackend?.();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setStatus("done");
                } catch (e) {
                    console.error("Erro ao salvar conclusão:", e);
                    setStatus("idle");
                    progressAnim.setValue(0);
                }

                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    speed: 30,
                    bounciness: 6,
                }).start();
            }, HOLD_DURATION);

        }, 100);
    };

    const handlePressOut = () => {
        if (isDone) return;

        if (holdTimer.current) clearTimeout(holdTimer.current);
        progressAnimation.current?.stop();

        if (status === "holding") {
            setStatus("idle");

            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                speed: 30,
                bounciness: 6,
            }).start();

            Animated.timing(progressAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }
    };

    const handleIconPress = () => {
        if (status === "holding") return;
        setShowDescription((prev) => !prev);
    };

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
    });

    const getBodyText = () => {
        if (status === "holding") return "Segure para concluir...";
        if (showDescription) return description;
        return description;
    };

    return (
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Animated.View
                style={[
                    styles.card,
                    isDone && styles.cardDone,
                    { transform: [{ scale: scaleAnim }] },
                ]}
            >
                <View style={styles.barTrack}>
                    <Animated.View style={[styles.barFill, { width: progressWidth }]} />
                </View>

                <View style={styles.shimmer} />

                <View style={[styles.content, { minHeight: cardSize }]}>
                    <Pressable onPress={handleIconPress}>
                        <View
                            style={[
                                styles.iconPlaceholder,
                                {
                                    width: iconSize,
                                    height: iconSize,
                                    backgroundColor: isDone ? "#c8c8c8" : iconColor,
                                },
                            ]}
                        />
                    </Pressable>

                    <View style={styles.textContainer}>
                        <Text style={[styles.title, isDone && styles.titleDone]}>
                            {title}
                        </Text>
                        <Text style={[styles.description, isDone && styles.descriptionDone]}>
                            {getBodyText()}
                        </Text>
                    </View>

                    {isDone && (
                        <View style={styles.checkBadge}>
                            <Text style={styles.checkMark}>✓</Text>
                        </View>
                    )}
                </View>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        width: "90%",
        alignSelf: "center",
        backgroundColor: "#5d57c7",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 12,
        overflow: "hidden",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.1)",
        shadowColor: "#3a3580",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    cardDone: {
        backgroundColor: "#ebebeb",
        borderColor: "#d4d4d4",
        shadowColor: "#aaaaaa",
        shadowOpacity: 0.2,
        elevation: 3,
    },
    shimmer: {
        position: "absolute",
        top: 0,
        left: 24,
        right: 24,
        height: 1,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 1,
    },
    barTrack: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    barFill: {
        height: "100%",
        backgroundColor: "rgba(255,255,255,0.5)",
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    iconPlaceholder: {
        borderRadius: 14,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 4,
        letterSpacing: -0.3,
    },
    titleDone: {
        color: "#4a4a4a",
    },
    description: {
        fontSize: 13,
        color: "rgba(220,218,255,0.85)",
        lineHeight: 18,
    },
    descriptionDone: {
        color: "#8a8a8a",
    },
    checkBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#b0b0b0",
        alignItems: "center",
        justifyContent: "center",
    },
    checkMark: {
        fontSize: 14,
        fontWeight: "700",
        color: "#ffffff",
    },
});
