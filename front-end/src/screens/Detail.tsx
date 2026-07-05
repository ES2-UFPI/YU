import { StyleSheet, View } from "react-native";
import { GoalCheckCard } from "../shared/components/GoalCheckCard";
import { QuestHeader } from "../shared/components/QuestHeader";
import { StatusBar } from "expo-status-bar";

const GOAL_CARD_SIZE = 80;

const GOALS = [
    {
        id: "run",
        title: "Corra!",
        description: "Yu precisa que você corra por 10 minutos",
        iconColor: "#59519e",
    },
    {
        id: "water",
        title: "Beba água!",
        description: "Yu precisa que você beba mais água",
        iconColor: "#59519e",
    },
    {
        id: "stretch",
        title: "Se alongue!",
        description: "O Yu precisa que você se alongue!",
        iconColor: "#59519e",
    },
    {
        id: "breathe",
        title: "Respire fundo!",
        description: "Yu precisa que você dê 3 respirações profundas para relaxar",
        iconColor: "#59519e",
    },
];

export const DetailPage = () => {
    const questProgress = {
        current: 1,
        total: GOALS.length,
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <QuestHeader
                title="Bem-vindo!"
                subtitle="Complete missões e deixe o Yu Feliz! As missões renovam todo dia."
                current={questProgress.current}
                total={questProgress.total}
            />

            <View style={styles.list}>
                {GOALS.map((goal) => (
                    <GoalCheckCard
                        key={goal.id}
                        title={goal.title}
                        description={goal.description}
                        iconColor={goal.iconColor}
                        cardSize={GOAL_CARD_SIZE}
                        onCompleteBackend={async () => {
                            // await markGoalAsComplete(goal.id);
                        }}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    list: {
        flex: 1,
        justifyContent: "space-evenly",
        paddingVertical: 12,
    },
});