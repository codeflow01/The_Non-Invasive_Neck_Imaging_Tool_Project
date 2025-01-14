import { View, Text, TouchableOpacity, } from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";

export default function Picker() {
  const [isProcessing, setIsProcessing] = useState(false);

  const triggerVideoProcessing = async () => {
    try {
      setIsProcessing(true);

      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Please enable media library permissions to select videos");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) {
        return;
      }

      const videoUri = result.assets[0].uri;
      console.log("Selected video URI:", videoUri);

      // Send video URI to backend
      const response = await fetch("SERVER_URL/diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUri }),
      });

      if (!response.ok) {
        throw new Error("Failed to process video");
      }

      const data = await response.json();
      console.log("Processing result:", data);

      alert("Video processed successfully!");
      router.back();
    } catch (error) {
      console.error("Error:", error);
      alert("Error processing video. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 justify-evenly items-center p-10">
        <TouchableOpacity
          onPress={triggerVideoProcessing}
          disabled={isProcessing}
          className="items-center bg-gray-100 p-8 rounded-lg w-4/5"
        >
          <FontAwesome5
            name={isProcessing ? "spinner" : "photo-video"}
            size={60}
            color="black"
          />
          <View className="items-center mt-4">
            {isProcessing ? (
              <>
                <Text className="font-semibold text-xl text-red-700">
                  Processing...
                </Text>
                <Text className="text-gray-500 text-center mt-1">
                  Analyzing your video
                </Text>
              </>
            ) : (
              <>
                {/* <Text className="font-semibold text-xl text-red-700">
                  Select a video to analyze
                </Text> */}
                <Text className="text-gray-500 text-center mt-1"
                style={{ fontSize: screenWidth * 0.04 }}
                >
                  Select a video from library for diagnosis
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
