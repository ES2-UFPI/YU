import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomePage } from "./screens/Home";
import { DetailPage } from "./screens/Detail";
import { GoalsScreen } from "./screens/Goals";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const BRAND = "#5d57c7";
const BRAND_LIGHT = "#eeedf9";
const INACTIVE = "#aaa8d4";

function HomeIcon({ color }: { color: string }) {
  return (
    <View style={[iconStyles.wrapper, { backgroundColor: color === BRAND ? BRAND_LIGHT : "transparent" }]}>
      <View style={[iconStyles.house, { borderColor: color }]}>
        <View style={[iconStyles.roof, { borderBottomColor: color }]} />
        <View style={[iconStyles.door, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function ShieldIcon({ color }: { color: string }) {
  return (
    <View style={[iconStyles.wrapper, { backgroundColor: color === BRAND ? BRAND_LIGHT : "transparent" }]}>
      <View style={[iconStyles.shield, { backgroundColor: color }]} />
    </View>
  );
}

const iconStyles = StyleSheet.create({
  wrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  house: {
    width: 22,
    height: 18,
    borderWidth: 2,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 2,
  },
  roof: {
    position: "absolute",
    top: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  door: {
    width: 8,
    height: 10,
    borderRadius: 2,
  },
  shield: {
    width: 20,
    height: 24,
    borderRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
});

const MainTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: "#5d57c7",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarActiveTintColor: BRAND,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="home"
        component={HomePage}
        options={{
          headerShown: false,
          tabBarLabel: "Início",
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="detail"
        component={DetailPage}
        options={{
          headerShown: false,
          tabBarLabel: "Missões",
          tabBarIcon: ({ color }) => <ShieldIcon color={color} />,
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