import { Stack } from "expo-router";

export default function VisionLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="camera"
        options={{
          presentation: "modal",
          headerTitle: "Capture Video",
        }}
      />
      <Stack.Screen
        name="picker"
        options={{
          presentation: "modal",
          headerTitle: "Instant Diagnosis",
        }}
      />
    </Stack>
  );
}
