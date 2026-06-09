import { Text, StyleSheet, View} from "react-native";


export const DetailPage = () => {
    return(
        <View style = {styles.container}>
            <Text>Details</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex:1,
        alignItems: "center",
        justifyContent: "center",
    }
})