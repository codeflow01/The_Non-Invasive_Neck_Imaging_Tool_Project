import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Index() {
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const containerWidth = screenWidth * 0.85;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["apiMessage"],
    queryFn: async () => {
      // ABI
      const response = await fetch("http://172.23.23.251:8000/api");
      // VIC
      // const response = await fetch("http://192.168.1.19:8000/api");
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
      setShowResult(false);
    } else {
      setShowResult(true);
      refetch();
    }
    setIsPressed(!isPressed);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View
        className="flex-1 items-center justify-center bg-gray-100"
        style={{ padding: screenWidth * 0.08 }}
      >
        <View
          className="bg-white rounded-xl"
          style={{
            width: containerWidth,
            padding: screenWidth * 0.05,
          }}
        >
          <Text
            className="font-bold text-center text-[#001e57]"
            style={{
              fontSize: screenWidth * 0.06,
              marginBottom: screenHeight * 0.02,
            }}
          >
            Test UI
          </Text>

          <TouchableOpacity
            onPress={handlePress}
            className={`items-center rounded-lg shadow-lg ${
              isPressed ? "bg-red-600" : "bg-[#001e57]"
            }`}
            style={{
              padding: screenWidth * 0.04,
              marginBottom: screenHeight * 0.02,
            }}
          >
            <Text
              className="text-white font-semibold text-center"
              style={{
                fontSize: screenWidth * 0.04,
              }}
            >
              {isPressed ? "Test Again" : "Test REST API Connection"}
            </Text>
          </TouchableOpacity>

          {showResult && isLoading && (
            <Text
              className="text-[#001e57] text-center"
              style={{
                fontSize: screenWidth * 0.045,
                marginTop: screenHeight * 0.02,
              }}
            >
              Loading...
            </Text>
          )}

          {showResult && error && (
            <Text
              className="text-red-500 text-center"
              style={{
                fontSize: screenWidth * 0.045,
                marginTop: screenHeight * 0.02,
              }}
            >
              Error: {error instanceof Error ? error.message : "Unknown error"}
            </Text>
          )}

          {showResult && data && (
            <Text
              className="text-[#001e57] text-center"
              style={{
                fontSize: screenWidth * 0.045,
                marginTop: screenHeight * 0.02,
              }}
            >
              REST API Status: {data.message}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
