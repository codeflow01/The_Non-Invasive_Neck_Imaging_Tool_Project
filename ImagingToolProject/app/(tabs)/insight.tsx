import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";

interface Params {
  plotUrl: string;
  registrationData: string;
}

export default function Insight() {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const params = useLocalSearchParams();

  // VIC
  // const SERVER_URL = "http://192.168.1.19:8000";
  // ABI
  const SERVER_URL = "http://172.23.23.251:8000";

  const plotUrl = params.plotUrl;
  const registrationData = params.registrationData;

  const { data, isLoading } = useQuery({
    queryKey: ["plot", plotUrl],
    queryFn: async () => {
      const timestamp = Date.now();
      return `${SERVER_URL}${plotUrl}?t=${timestamp}`;
    },
    enabled: plotUrl !== undefined,
  });

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View
        className="flex-1 bg-gray-100 justify-center"
        style={{ padding: screenWidth * 0.05 }}
      >
        <View className="bg-white rounded-xl shadow-md overflow-hidden p-4">
          <Text
            className="text-[#001e57] font-bold text-center mb-6"
            style={{ fontSize: screenWidth * 0.06 }}
          >
            Diagnosis Results
          </Text>
          {isLoading ? (
            <View className="items-center justify-center p-8">
              <ActivityIndicator size="large" color="#001e57" />
              <Text
                className="text-gray-600 mt-4 text-center"
                style={{ fontSize: screenWidth * 0.04 }}
              >
                Loading diagnosis results...
              </Text>
            </View>
          ) : data ? (
            <View>
              <View className="bg-gray-50 rounded-lg mb-4">
                <Image
                  source={{ uri: data }}
                  style={{
                    width: "100%",
                    height: screenWidth * 0.6,
                  }}
                  resizeMode="contain"
                />
              </View>
              {registrationData && (
                <View className="mt-4">
                  <Text
                    className="text-gray-600 text-center"
                    style={{ fontSize: screenWidth * 0.035 }}
                  >
                    Detailed data has been exported to csv file
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text
              className="text-gray-600 text-center"
              style={{ fontSize: screenWidth * 0.04 }}
            >
              Run the diagnosis first
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
