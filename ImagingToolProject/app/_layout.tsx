import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../global.css";
import { TamaguiProvider, createTamagui } from "tamagui";
import { config } from "@tamagui/config";
// import { PaperProvider } from "react-native-paper";

const queryClient = new QueryClient();

const tamaguiConfig = createTamagui(config);

type Conf = typeof tamaguiConfig;
declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends Conf {}
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig}>
        {/* <PaperProvider> */}
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        {/* </PaperProvider> */}
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
