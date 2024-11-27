import { View, Text } from "react-native";
import { TouchableOpacity } from "react-native";
import { useState } from "react";

export default function featureTBD() {
  const [isPressed, setIsPressed] = useState<boolean>(false);

  return (
    











    <View className="flex-1 items-center justify-center">
      <TouchableOpacity onPress={() => setIsPressed(!isPressed)}>
        <Text
          className={`font-bold ${
            isPressed ? "text-blue-600" : "text-red-700"
          } ${isPressed ? "text-4xl" : "text-2xl"}`}
        >
          {isPressed ? "Feature TBD" : "NECK IMAGE PROJECT"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
