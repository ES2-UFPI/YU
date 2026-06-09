import { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { GoalCard } from "../shared/components/GoalCard";

const GOALS = [
    {
        id: "hydration",
        title: "Beber mais agua",
        description: "Manter uma hidratacao mais consistente ao longo do dia.",
        iconColor: "#1A73E8",
    },
    {
        id: "screen_time_balance",
        title: "Reduzir tempo de tela",
        description: "Equilibrar o uso do dispositivo e incentivar pausas saudaveis.",
        iconColor: "#E05C3A",
    },
    {
        id: "physical_activity",
        title: "Praticar atividade fisica",
        description: "Aumentar o movimento diario com exercicios leves ou moderados.",
        iconColor: "#F4A62A",
    },
    {
        id: "read_more",
        title: "Ler mais livros",
        description: "Incentivar a leitura regular para estimular o aprendizado e a criatividade.",
        iconColor: "#34A853",
    },
    {
        id: "study",
        title: "Estudar mais",
        description: "Dedicar tempo ao aprendizado continuo para desenvolver competencias.",
        iconColor: "#8E44AD",
    },
    {
        id: "healthy_eating",
        title: "Alimentacao saudavel",
        description: "Incentivar uma alimentacao balanceada e nutritiva.",
        iconColor: "#E91E8C",
    },
];

export const GoalsScreen = () => {
    const navigation = useNavigation<any>();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <Text style={styles.headerText}>
                        Escolha seus{" "}
                        <Text style={styles.headerHighlight}>objetivos</Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        Selecione o que melhor representa sua meta atual.
                    </Text>
                </View>

                {/* Cards */}
                {GOALS.map((goal) => (
                    <GoalCard
                        key={goal.id}
                        title={goal.title}
                        description={goal.description}
                        iconColor={goal.iconColor}
                        selected={selectedIds.includes(goal.id)}
                        onPress={() =>
                            setSelectedIds((prev) =>
                                prev.includes(goal.id)
                                    ? prev.filter((id) => id !== goal.id)
                                    : [...prev, goal.id]
                            )
                        }
                    />
                ))}

                <TouchableOpacity
                    style={[styles.button, selectedIds.length === 0 && styles.buttonDisabled]}
                    onPress={() => navigation.replace("Main")}
                    disabled={selectedIds.length === 0}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Avancar</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F7F7F7",
    },
    scroll: {
        paddingTop: 32,
        paddingBottom: 40,
    },
    header: {
        width: "90%",
        alignSelf: "center",
        marginBottom: 24,
    },
    headerText: {
        fontSize: 26,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 6,
    },
    headerHighlight: {
        color: "#1A73E8",
        fontWeight: "700",
    },
    subtitle: {
        fontSize: 14,
        color: "#666666",
        lineHeight: 20,
    },
    button: {
        width: "90%",
        alignSelf: "center",
        backgroundColor: "#1A73E8",
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 24,
    },
    buttonDisabled: {
        backgroundColor: "#C0C0C0",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
});