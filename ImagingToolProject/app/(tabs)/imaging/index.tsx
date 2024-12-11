import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function Imaging() {
  return (
    <View className="flex-1 justify-center items-center">
      <TouchableOpacity onPress={() => router.push("/(tabs)/imaging/camera")}>
        <View className="items-center">
          <FontAwesome5 name="video" size={50} color="black" />
        </View>
        <Text className="font-bold text-2xl text-red-700 mt-5">
          Press to Record Video
        </Text>
      </TouchableOpacity>
    </View>
  );
}
