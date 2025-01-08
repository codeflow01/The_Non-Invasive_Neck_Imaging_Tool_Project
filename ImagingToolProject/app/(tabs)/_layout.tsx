import { Tabs } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Dimensions } from "react-native";

export default function TabLayout() {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const horizontalPadding = screenWidth * 0.08;
  const bottomPadding = screenHeight * 0.04;
  const tabBarHeight = screenHeight * 0.08;
  const tabBarWidth = screenWidth * 0.85;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#001e57",
        tabBarInactiveTintColor: "#9E9E9E",
        tabBarStyle: {
          height: tabBarHeight,
          width: tabBarWidth,
          paddingBottom: screenHeight * 0.01,
          paddingTop: screenHeight * 0.01,
          backgroundColor: "white",
          position: "relative",
          bottom: bottomPadding,
          alignSelf: "center",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: screenWidth * 0.04,
          borderTopWidth: 0,
          elevation: 3,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: screenWidth * 0.03,
          marginTop: screenHeight * 0.005,
        },
        tabBarIconStyle: {
          width: screenWidth * 0.06,
          height: screenWidth * 0.06,
        },
      }}
    >
      {/* <Tabs screenOptions={{ tabBarActiveTintColor: "#001e57" }}> */}

      <Tabs.Screen
        name="index"
        options={{
          title: "Formula",
          headerShown: false,
          tabBarIcon: () => (
            <FontAwesome5 name="ello" size={24} color="#001e57" />
          ),
        }}
      />

      <Tabs.Screen
        name="imaging"
        options={{
          title: "Vision",
          headerShown: false,
          tabBarIcon: () => (
            <FontAwesome5 name="cloudsmith" size={24} color="#001e57" />
          ),
        }}
      />

      <Tabs.Screen
        name="insight"
        options={{
          title: "Insight",
          headerShown: false,
          tabBarIcon: () => (
            <FontAwesome5 name="chart-line" size={24} color="#001e57" />
          ),
        }}
      />

      {/* <Tabs.Screen
        name="beta"
        options={{
          title: "Python_Server",
          headerShown: false,
          tabBarIcon: () => (
            <FontAwesome5 name="connectdevelop" size={24} color="#001e57" />
          ),
        }}
      /> */}

    </Tabs>
  );
}
