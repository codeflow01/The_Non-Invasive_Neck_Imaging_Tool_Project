import { Stack } from 'expo-router';

export default function FeatureLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} // hide header since it's in tabs
      />
      <Stack.Screen 
        name="featureModal" 
        options={{ 
          presentation: 'modal',
          headerTitle: 'Feature Modal' 
        }}
      />
    </Stack>
  );
}