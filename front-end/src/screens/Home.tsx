import { Text, View, StyleSheet, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { OfensiveHeader } from "../shared/components/OfensiveHeader";
import { MascotAnimation } from "../shared/components/Mascotanimation";

export const HomePage = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <OfensiveHeader />
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5d57c7",
  },
  list: {
    flexGrow: 1,
    paddingVertical: 12,
    paddingBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  mascotCenter: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
  },
});