import { Tabs } from "expo-router";
import { IconButton, MD3Colors } from "react-native-paper";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "darkred" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: () => (
            <IconButton icon="home" iconColor={MD3Colors.error30} />
          ),
        }}
      />

      <Tabs.Screen
        name="cameraApp"
        options={{
          title: "Camera",
          headerShown: false,
          tabBarIcon: () => (
            <IconButton icon="camera" iconColor={MD3Colors.error30} />
          ),
        }}
      />
    </Tabs>
  );
}
