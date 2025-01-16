import { View, Text, TouchableOpacity, Dimensions, Modal } from "react-native";
import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEvent } from "expo";
import { useMutation } from "@tanstack/react-query";

interface UploadResponse {
  success: boolean;
  message: string;
  filename: string;
  path: string;
}

interface DiagnosisResponse {
  success: boolean;
  videoName: string;
  results: {
    displacement_plot: string;
    registration_data: string;
  };
  message: string;
}

interface VideoUpload {
  uri: string;
  type: string;
  name: string;
}

export default function Picker() {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // VIC
  // const SERVER_URL = "http://192.168.1.19:8000";
  // ABI
  const SERVER_URL = "http://172.23.23.251:8000";

  const [videoUri, setVideoUri] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showCompletionModal, setShowCompletionModal] =
    useState<boolean>(false);
  const [diagnosisResult, setDiagnosisResult] =
    useState<DiagnosisResponse | null>(null);

  const player = useVideoPlayer(videoUri || "", (player) => {
    if (player) {
      player.loop = true;
    }
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const handleVideoSelection = async () => {
    try {
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

      const selectedVideoUri = result.assets[0].uri;
      console.log("Selected video URI:", selectedVideoUri);
      setVideoUri(selectedVideoUri);
    } catch (error) {
      console.error("Error:", error);
      alert("Error selecting video. Please try again.");
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async (videoUri: string) => {
      const formData = new FormData();
      const videoUpload: VideoUpload = {
        uri: videoUri,
        type: "video",
        name: `${Date.now()}.mp4`,
      };
      formData.append("video", videoUpload as any);

      const response = await fetch(`${SERVER_URL}/upload/video`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload video");
      }
      return response.json() as Promise<UploadResponse>;
    },
  });

  const diagnosisMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${SERVER_URL}/diagnosis/cardiac`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json() as Promise<DiagnosisResponse>;
    },
  });

  const handleNavigateToInsight = () => {
    if (!diagnosisResult?.results) return;
    setShowCompletionModal(false);
    router.push({
      pathname: "/(tabs)/insight",
      params: {
        plotUrl: diagnosisResult.results.displacement_plot,
        registrationData: diagnosisResult.results.registration_data,
      },
    });
  };

  const handleVideoAnalysis = async () => {
    if (!videoUri) {
      alert("Please select a video first");
      return;
    }
    try {
      setIsProcessing(true);

      const uploadResult = await uploadMutation.mutateAsync(videoUri);

      if (uploadResult.success) {
        const result = await diagnosisMutation.mutateAsync();

        if (result.success) {
          setDiagnosisResult(result);
          setShowCompletionModal(true);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error processing video. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (videoUri) {
    return (
      <SafeAreaView className="flex-1">
        <View className="flex-1">
          <VideoView
            style={{ flex: 1, width: screenWidth, height: screenHeight }}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
          />
          <View className="" style={{ padding: screenWidth * 0.04 }}>
            <TouchableOpacity
              onPress={handleVideoAnalysis}
              disabled={isProcessing}
              className="items-center bg-[#001e57] rounded-lg p-5 shadow-lg"
            >
              <Text
                className="text-white font-semibold"
                style={{
                  fontSize: screenWidth * 0.04,
                }}
              >
                {isProcessing ? "Processing..." : "Diagnosis"}
              </Text>
            </TouchableOpacity>
          </View>
          {isProcessing && (
            <View className="flex-1 justify-center items-center p-4 bg-black/50">
              <Text
                className="text-white text-center"
                style={{
                  fontSize: screenWidth * 0.08,
                }}
              >
                Diagnosing...
              </Text>
            </View>
          )}

          <Modal
            transparent={true}
            visible={showCompletionModal}
            animationType="fade"
          >
            <View className="flex-1 justify-center items-center bg-black/50">
              <TouchableOpacity
                onPress={handleNavigateToInsight}
                className="bg-white rounded-2xl p-6 items-center mx-8"
              >
                <FontAwesome5 name="check-circle" size={60} color="#001e57" />
                <Text
                  className="text-[#001e57] font-bold mt-4 text-center"
                  style={{ fontSize: screenWidth * 0.05 }}
                >
                  Diagnosis Completed
                </Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 justify-evenly items-center p-10">
        <TouchableOpacity
          onPress={handleVideoSelection}
          disabled={isProcessing}
          className="items-center bg-gray-100 p-8 rounded-lg w-4/5 shadow-sm"
        >
          <FontAwesome5
            name={isProcessing ? "spinner" : "photo-video"}
            size={60}
            color="black"
          />
          <View className="items-center mt-4">
            <Text
              className="text-gray-600 text-center mt-1"
              style={{ fontSize: screenWidth * 0.04 }}
            >
              Select a video from library for diagnosis
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
