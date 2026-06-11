import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type GoalCardProps = {
    title: string;
    description: string;
    iconColor?: string;
    iconSize?: number;
    selected?: boolean;
    onPress?: () => void;
};

export const GoalCard = ({
    title,
    description,
    iconColor = "#A0A0A0",
    iconSize = 56,
    selected = false,
    onPress,
}: GoalCardProps) => {
    return (
        <TouchableOpacity
            style={[styles.card, selected && styles.cardSelected]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.content}>
                <View
                    style={[
                        styles.iconPlaceholder,
                        { width: iconSize, height: iconSize, backgroundColor: iconColor },
                    ]}
                />

                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description}>{description}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: "90%",
        alignSelf: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "#E0E0E0",
        paddingHorizontal: 16,
        paddingVertical: 18,
        marginBottom: 12,
        overflow: "hidden",
    },
    cardSelected: {
        borderColor: "#1A73E8",
        borderWidth: 2,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    iconPlaceholder: {
        borderRadius: 10,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        color: "#555555",
        lineHeight: 18,
    },
});