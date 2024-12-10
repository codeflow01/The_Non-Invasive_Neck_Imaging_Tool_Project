import { View, Text } from "react-native";
import { TouchableOpacity } from "react-native";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function Beta() {
  const [isPressed, setIsPressed] = useState<boolean>(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["apiMessage"],
    queryFn: async () => {
      const response = await fetch("http://192.168.1.19:8000/api");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    enabled: isPressed,
  });

  return (
    <View className="flex-1 items-center justify-center">
      <TouchableOpacity onPress={() => setIsPressed(!isPressed)}>
        <Text
          className={`font-bold ${
            isPressed ? "text-[#8389ff]" : "text-[#001e57]"
          } ${isPressed ? "text-4xl" : "text-2xl"}`}
        >
          {isPressed ? "GOOD LUCK!" : "NECK IMAGE PROJECT API"}
        </Text>
      </TouchableOpacity>

      {isLoading && <Text className="mt-20">Loading...</Text>}
      {error && (
        <Text className="mt-40 text-red-700">
          Error: {error instanceof Error ? error.message : "Unknown error"}
        </Text>
      )}
      {data && (
        <Text className="mt-40 text-red-700 font-semibold text-2xl">
          Server says: {data.message}
        </Text>
      )}
    </View>
  );
}
