import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React from "react";

export default function Imaging() {
  return (
    <View className="flex-1 flex-row justify-center items-center">
      <TouchableOpacity onPress={() => router.push("/(tabs)/imaging/camera")}>
        <View className="items-center">
          <FontAwesome5 name="video" size={30} color="black" />
        </View>
        <View className="items-center">
          <Text className="font-bold text-xl text-red-700 mt-5">
            Press to Record Video
          </Text>
          {/* <Text className="font-bold text-1xl text-red-700">(30FPS)</Text> */}
        </View>
      </TouchableOpacity>

      <View className="m-2"></View>

      <TouchableOpacity onPress={() => router.push("/(tabs)/imaging/picker")}>
        <View className="items-center">
          <FontAwesome5 name="file-video" size={30} color="black" />
        </View>
        <View className="items-center">
          <Text className="font-bold text-xl text-red-700 mt-5">
            Press to Upload Video
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
