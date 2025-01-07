import React from "react";
import { Stack, Link } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 mt-72 items-center">
        <Text className="text-2xl font-bold text-red-700">
          This screen doesn't exist.
        </Text>
        <View className="mt-5">
          <Link href="/">
            <Text className="text-2xl font-bold text-blue-800">
              Touch to go to home screen!
            </Text>
          </Link>
        </View>
      </View>
    </>
  );
}
