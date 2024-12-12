import { View, Text } from "react-native";
import { TouchableOpacity } from "react-native";
import { useState } from "react";

export default function Index() {
  const [isPressed, setIsPressed] = useState<boolean>(false);

  return (
    <View className="flex-1 items-center justify-center">
      <TouchableOpacity onPress={() => setIsPressed(!isPressed)}>
        <Text
          className={`font-bold bg-neutral-300 p-2 rounded-lg shadow-sm ${
            isPressed ? "text-red-700" : "text-[#001e57]"
          } ${isPressed ? "text-2xl" : "text-2xl"}`}
        >
          {isPressed ? "Good Luck!" : "Neck Image Project"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
