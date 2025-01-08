import { Stack } from "expo-router";

export default function FeatureLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="camera"
        options={{
          presentation: "modal",
          headerTitle: "Record Video",
        }}
      />
      <Stack.Screen
        name="picker"
        options={{
          presentation: "modal",
          headerTitle: "Upload Video",
        }}
      />
    </Stack>
  );
}
