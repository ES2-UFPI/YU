import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { HomePage } from "./screens/Home";
import { DetailPage } from "./screens/Detail";
import { GoalsScreen } from "./screens/Goals";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab Navigator separado
const MainTabs = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen
            name="home"
            component={HomePage}
            options={{
                headerShown: false,
            }}
            />
            <Tab.Screen
                name="detail"
                component={DetailPage}
                options={{
                    headerShown: false,
                    tabBarLabel: "Objetivos",
                }}
            />
        </Tab.Navigator>
    );
};

export const AppRoutes = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Goals" component={GoalsScreen} />
                <Stack.Screen name="Main" component={MainTabs} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};