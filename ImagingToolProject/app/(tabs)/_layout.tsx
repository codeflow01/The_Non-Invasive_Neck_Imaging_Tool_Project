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
        name="imaging"
        options={{
          title: "Imaging",
          headerShown: false,
          tabBarIcon: () => (
            <FontAwesome5 name="cloudsmith" size={24} color="#001e57" />
          ),
        }}
      />

      <Tabs.Screen
        name="beta"
        options={{
          title: "Python_Server",
          headerShown: false,
          tabBarIcon: () => (
            <FontAwesome5 name="connectdevelop" size={24} color="#001e57" />
          ),
        }}
      />

      <Tabs.Screen
        name="gamma"
        options={{
          title: "Test_Gamma",
          headerShown: false,
          tabBarIcon: () => (
            <FontAwesome5 name="connectdevelop" size={24} color="#001e57" />
          ),
        }}
      />
    </Tabs>
  );
}
