import { View, Text, StyleSheet, useWindowDimensions, Image, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReactNode, useEffect, useRef } from "react";

type QuestHeaderProps = {
    title?: string;
    subtitle?: string;
    current?: number;
    total?: number;
    completed?: boolean;
    progressBar?: ReactNode;
};

export const QuestHeader = ({
    title = "Bem-vindo!",
    subtitle = "Complete missões e deixe o Yu Feliz!",
    current = 0,
    total = 10,
    completed = false,
    progressBar,
}: QuestHeaderProps) => {
    const { height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const progressAnim = useRef(new Animated.Value(0)).current;
    const progress = Math.min(current / total, 1);

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 700,
            useNativeDriver: false,
        }).start();
    }, [current, total]);

    return (
        <View style={[styles.header, { height: height * 0.28 + insets.top, paddingTop: insets.top + 12 }]}>
            <View style={styles.circle1} />
            <View style={styles.circle2} />

            <View style={styles.textBlock}>
                <Text style={[styles.title, completed && styles.titleDone]}>
                    {title}
                </Text>
                <Text style={[styles.subtitle, completed && styles.subtitleDone]}>
                    {subtitle}
                </Text>

                <View style={styles.progressRow}>
                    {progressBar ?? (
                        <View style={styles.barTrack}>
                            <Animated.View
                                style={[
                                    styles.barFill,
                                    {
                                        width: progressAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ["0%", "100%"],
                                        }),
                                    },
                                ]}
                            >
                                <Text style={[styles.progressLabel, completed && styles.progressLabelDone]}>
                                    {current} / {total}
                                </Text>
                            </Animated.View>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.mascotBlock}>
                <Text style={styles.sparkle1}>✦</Text>
                <Text style={styles.sparkle2}>✦</Text>
                <View style={styles.mascotShadow} />
                <Image
                    source={require("../../../assets/mascot/icons/icon_yu_happy.png")}
                    style={styles.mascot}
                    resizeMode="contain"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        width: "100%",
        backgroundColor: "#5d57c7",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 20,
        overflow: "hidden",
    },
    circle1: {
        position: "absolute",
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: "rgba(255,255,255,0.06)",
        top: -60,
        right: -30,
    },
    circle2: {
        position: "absolute",
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(255,255,255,0.04)",
        top: 30,
        right: 80,
    },
    textBlock: {
        flex: 1,
        paddingRight: 12,
        gap: 6,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: "#ffffff",
    },
    titleDone: {
        color: "#4a4a4a",
    },
    subtitle: {
        fontSize: 12,
        color: "rgba(255,255,255,0.85)",
        lineHeight: 17,
    },
    subtitleDone: {
        color: "#7a7a7a",
    },
    progressRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 6,
    },
    barTrack: {
        flex: 1,
        height: 28,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.2)",
        overflow: "hidden",
    },
    barFill: {
        height: "100%",
        borderRadius: 999,
        backgroundColor: "#f5c400",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 60,
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    progressLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#a06000",
    },
    progressLabelDone: {
        color: "#5a5a5a",
    },
    mascotBlock: {
        width: 120,
        height: 120,
        alignItems: "flex-end",
        justifyContent: "flex-end",
    },
    mascot: {
        width: 120,
        height: 120,
    },
    mascotShadow: {
        position: "absolute",
        bottom: -4,
        alignSelf: "center",
        width: 60,
        height: 14,
        borderRadius: 999,
        backgroundColor: "rgba(0,0,0,0.15)",
    },
    sparkle1: {
        position: "absolute",
        top: 4,
        right: 18,
        fontSize: 10,
        color: "rgba(255,255,255,0.7)",
    },
    sparkle2: {
        position: "absolute",
        top: 18,
        left: 4,
        fontSize: 16,
        color: "rgba(255,255,255,0.5)",
    },
});
