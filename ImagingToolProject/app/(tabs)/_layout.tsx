import { Tabs } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#001e57" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: () => (
            <FontAwesome5 name="home" size={24} color="#001e57" />
          ),
        }}
      />

      <Tabs.Screen
        name="cameraApp"
        options={{
          title: "Demo",
          headerShown: false,
          tabBarIcon: () => (
            <FontAwesome5 name="apple-alt" size={24} color="#001e57" />
          ),
        }}
      />

      <Tabs.Screen
        name="featureTBD"
        options={{
          title: "Camera",
          headerShown: false,
          tabBarIcon: () => (
            <FontAwesome5 name="camera" size={24} color="#001e57" />
          ),
        }}
      />

      <Tabs.Screen
        name="beta"
        options={{
          title: "API",
          headerShown: false,
          tabBarIcon: () => (
            <FontAwesome5 name="bullseye" size={24} color="#001e57" />
          ),
        }}
      />
    </Tabs>
  );
}
