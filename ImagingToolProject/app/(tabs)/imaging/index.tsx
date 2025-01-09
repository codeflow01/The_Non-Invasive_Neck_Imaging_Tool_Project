import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React from "react";

export default function Imaging() {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const tabBarWidth = screenWidth * 0.85;

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View
        className="flex-1 items-center justify-center bg-gray-100"
        style={{ padding: screenWidth * 0.08 }}
      >
        <View
          className="bg-white rounded-xl"
          style={{
            width: tabBarWidth,
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
            Diagnosis System
          </Text>

          <View
            className="items-center"
            style={{ marginBottom: screenHeight * 0.04 }}
          >
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/imaging/camera")}
              className="items-center bg-[#001e57] rounded-xl shadow-lg w-full py-6"
            >
              <FontAwesome5
                name="video"
                size={screenWidth * 0.12}
                color="white"
              />
              <Text
                className="font-semibold text-white"
                style={{
                  fontSize: screenWidth * 0.045,
                  marginTop: screenHeight * 0.02,
                }}
              >
                Capture Video
              </Text>
            </TouchableOpacity>
          </View>

          <View className="items-center">
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/imaging/picker")}
              className="items-center bg-[#001e57] rounded-xl shadow-lg w-full py-6"
            >
              <FontAwesome5
                name="cloud"
                size={screenWidth * 0.12}
                color="white"
              />
              <Text
                className="font-semibold text-white"
                style={{
                  fontSize: screenWidth * 0.045,
                  marginTop: screenHeight * 0.02,
                }}
              >
                Instant Diagnosis
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
