import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  SafeAreaView,
} from "react-native";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

export default function Index() {
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const containerWidth = screenWidth * 0.85;

  const SERVER_URL = "http://192.168.1.19:8000";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["cleanupMessage"],
    queryFn: async () => {
      const response = await fetch(`${SERVER_URL}/cleanup_server_storage`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    enabled: isPressed,
  });

  const handlePress = () => {
    if (isPressed) {
      queryClient.removeQueries({ queryKey: ["cleanupMessage"] });
      setShowResult(false);
    } else {
      setShowResult(true);
      refetch();
    }
    setIsPressed(!isPressed);
  };

  const handleNavigateToImaging = () => {
    router.push("/(tabs)/imaging");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-gray-100">
      <ScrollView>
        <View
          className="items-center mt-20"
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
                marginBottom: screenHeight * 0.04,
              }}
            >
              Non-Contact Diagnosis
            </Text>

            <TouchableOpacity onPress={handleNavigateToImaging}>
              <View
                className="flex items-center justify-center p-1.5 shadow-lg"
                style={{ height: containerWidth * 0.9 }}
              >
                <Image
                  source={require("../../assets/images/jvp.webp")}
                  style={{
                    width: "100%",
                    height: "100%",
                    aspectRatio: 1,
                    resizeMode: "contain",
                    borderRadius: 12,
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View
          className="flex-1 items-center justify-end  bg-gray-100"
          style={{ padding: screenWidth * 0.08 }}
        >
          <View
            className="bg-white rounded-xl"
            style={{
              width: containerWidth,
              padding: screenWidth * 0.05,
            }}
          >
            {/* <Text
            className="font-bold text-center text-[#001e57]"
            style={{
              fontSize: screenWidth * 0.06,
              marginBottom: screenHeight * 0.02,
            }}
          >
            Clean Server Storage
          </Text> */}

            <TouchableOpacity
              onPress={handlePress}
              className={`items-center rounded-lg shadow-lg ${
                isPressed ? "bg-gray-200" : "bg-[#001e57]"
              } ${isPressed ? "shadow-sm" : "shadow-lg"}`}
              style={{
                padding: screenWidth * 0.04,
                // marginBottom: screenHeight * 0.02,
              }}
            >
              <Text
                className={`font-semibold text-center ${
                  isPressed ? "text-gray-700" : "text-white"
                }
              `}
                style={{
                  fontSize: screenWidth * 0.04,
                }}
              >
                {isPressed ? "Clean Again" : "Clean Up Server Storage"}
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
                Error:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </Text>
            )}

            {showResult && data && (
              <Text
                className="text-gray-600 text-center"
                style={{
                  fontSize: screenWidth * 0.045,
                  marginTop: screenHeight * 0.02,
                }}
              >
                {data.message}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
