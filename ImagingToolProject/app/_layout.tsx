import { Stack } from "expo-router";
import "../global.css";
import { TamaguiProvider, createTamagui } from "tamagui";
import { config } from "@tamagui/config";
// import { PaperProvider } from "react-native-paper";

const tamaguiConfig = createTamagui(config);

type Conf = typeof tamaguiConfig;
declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends Conf {}
}

export default function RootLayout() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      {/* <PaperProvider> */}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      {/* </PaperProvider> */}
    </TamaguiProvider>
  );
}
