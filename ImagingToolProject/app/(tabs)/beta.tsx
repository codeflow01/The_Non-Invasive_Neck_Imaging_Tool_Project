import { View, Text } from "react-native";
import { TouchableOpacity } from "react-native";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Beta() {
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["apiMessage"],
    queryFn: async () => {
      // Home
      // const response = await fetch("http://192.168.1.19:8000/api");
      // ABI
      const response = await fetch("http://172.23.127.183:8000/api");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    enabled: isPressed,
  });

  const handlePress = () => {
    if (isPressed) {
      queryClient.removeQueries({ queryKey: ["apiMessage"] });
    } else {
      refetch();
    }
    setIsPressed(!isPressed);
  };

  return (
    <View className="flex-1 items-center justify-center">
      <TouchableOpacity onPress={handlePress}>
        <Text
          className={`font-bold bg-neutral-300 p-2 rounded-lg shadow-sm text-center ${
            isPressed ? "text-red-700" : "text-[#001e57]"
          } ${isPressed ? "text-2xl" : "text-2xl"}`}
        >
          {isPressed
            ? "Press To Test Again"
            : "Press to Test\n REST API Connection"}
        </Text>
      </TouchableOpacity>
      {isLoading && (
        <Text className="mt-20 text-red-700 text-2xl">Loading...</Text>
      )}
      {error && (
        <Text className="mt-20 text-red-700 text-2xl">
          Error: {error instanceof Error ? error.message : "Unknown error"}
        </Text>
      )}
      {data && (
        <Text className="mt-20 text-[#001e57] text-2xl text-center">
          *REST API Status* {"\n"} {data.message}
        </Text>
      )}
    </View>
  );
}
