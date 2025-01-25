import { View, Text, TouchableOpacity, Dimensions, Modal } from "react-native";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router, useLocalSearchParams } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEvent } from "expo";
import { useMutation } from "@tanstack/react-query";
import { useRoiBridge } from "../../../components/RoiBridge";

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

interface ROIFrame {
  success: boolean;
  roiFrame: string;
  message: string;
}

interface ROI {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function Picker() {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // VIC
  const SERVER_URL = "http://192.168.1.19:8000";
  // ABI
  // const SERVER_URL = "http://172.23.23.251:8000";

  const [videoUri, setVideoUri] = useState<string | undefined>(undefined);
  // const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showCompletionModal, setShowCompletionModal] =
    useState<boolean>(false);
  const [diagnosisResult, setDiagnosisResult] =
    useState<DiagnosisResponse | null>(null);
  const [roiFrame, setRoiFrame] = useState<string | null>(null);
  const [showRoiSelection, setShowRoiSelection] = useState(false);
  const [roi, setRoi] = useState<ROI | null>(null);
  const [isVideoConfirmed, setIsVideoConfirmed] = useState(false);

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

  // const videoUploadMutation = useMutation({
  //   mutationFn: async (videoUri: string) => {
  //     const formData = new FormData();
  //     const videoUpload: VideoUpload = {
  //       uri: videoUri,
  //       type: "video",
  //       name: `${Date.now()}.mp4`,
  //     };
  //     formData.append("video", videoUpload as any);

  //     const response = await fetch(`${SERVER_URL}/upload/video`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //       body: formData,
  //     });
  //     if (!response.ok) {
  //       throw new Error("Failed to upload video");
  //     }
  //     return response.json() as Promise<UploadResponse>;
  //   },
  // });

  // const roiFrameMutation = useMutation({
  //   mutationFn: async () => {
  //     const response = await fetch(`${SERVER_URL}/video/roi-frame`);
  //     if (!response.ok) {
  //       throw new Error("Failed to get ROI frame");
  //     }
  //     const result = await response.json();
  //     return result as ROIFrame;
  //   },
  // });

  // const diagnosisMutation = useMutation({
  //   mutationFn: async (roi: ROI) => {
  //     const response = await fetch(`${SERVER_URL}/diagnosis/cardiac`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ roi }),
  //     });
  //     if (!response.ok) {
  //       throw new Error("Network response was not ok");
  //     }
  //     return response.json() as Promise<DiagnosisResponse>;
  //   },
  // });

  const { handleRoiFrame, isProcessing } = useRoiBridge({
    SERVER_URL,
    videoUri: videoUri!,
    onError: (error) => alert("Error processing video. Please try again."),
  });

  // const handleVideoAndRoiFrame = async () => {
  //   if (!videoUri) {
  //     alert("Please select a video first");
  //     return;
  //   }
  //   try {
  //     setIsProcessing(true);
  //     const uploadResult = await videoUploadMutation.mutateAsync(videoUri!);
  //     if (uploadResult.success) {
  //       const roiFrameResult = await roiFrameMutation.mutateAsync();
  //       if (roiFrameResult.success) {
  //         router.push({
  //           pathname: "./roi",
  //           params: {
  //             videoUri: videoUri,
  //             roiFrame: `${SERVER_URL}${roiFrameResult.roiFrame}`,
  //             screenWidth: screenWidth,
  //             screenHeight: screenHeight,
  //           },
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //     alert("Error processing video. Please try again.");
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  // const handleRoiSelected = async (selectedRoi: ROI) => {
  //   try {
  //     setIsProcessing(true);
  //     setShowRoiSelection(false);
  //     setRoi(selectedRoi);

  //     const result = await diagnosisMutation.mutateAsync(selectedRoi);
  //     if (result.success) {
  //       setDiagnosisResult(result);
  //       setShowCompletionModal(true);
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //     alert("Error processing video. Please try again.");
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  // const handleResultToInsight = () => {
  //   if (!diagnosisResult?.results) return;
  //   setShowCompletionModal(false);
  //   router.push({
  //     pathname: "/(tabs)/insight",
  //     params: {
  //       plotUrl: diagnosisResult.results.displacement_plot,
  //       registrationData: diagnosisResult.results.registration_data,
  //     },
  //   });
  // };

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
              onPress={handleRoiFrame}
              disabled={isProcessing}
              className="items-center bg-[#001e57] rounded-lg p-5 shadow-lg"
            >
              <Text
                className="text-white font-semibold"
                style={{ fontSize: screenWidth * 0.04 }}
              >
                Confirm and Draw ROI
              </Text>
            </TouchableOpacity>
          </View>

          {/* {showRoiSelection && roiFrame && (
            <RoiTool
              onRoiSelected={(selectedRoi) => {
                setRoi(selectedRoi);
                setShowRoiSelection(false);
              }}
              onCancel={() => {
                setShowRoiSelection(false);
                setIsVideoConfirmed(false);
              }}
              videoWidth={screenWidth}
              videoHeight={screenHeight}
              imageUri={roiFrame}
            />
          )} */}

          {isProcessing && (
            <View className="flex-1 justify-center items-center p-4 bg-black/50">
              <Text
                className="text-white text-center"
                style={{
                  fontSize: screenWidth * 0.08,
                }}
              >
                {!isVideoConfirmed
                  ? "Loading ROI frame..."
                  : showRoiSelection
                  ? "Please select ROI"
                  : "Diagnosing..."}
              </Text>
            </View>
          )}

          {/* <Modal
            transparent={true}
            visible={showCompletionModal}
            animationType="fade"
          >
            <View className="flex-1 justify-center items-center bg-black/50">
              <TouchableOpacity
                onPress={handleResultToInsight}
                className="bg-white rounded-2xl p-6 items-center mx-8"
              >
                <FontAwesome5 name="check-circle" size={60} color="#001e57" />
                <Text
                  className="text-[#001e57] font-bold mt-4 text-center"
                  style={{ fontSize: screenWidth * 0.05 }}
                >
                  Diagnosis Completed
                </Text>
                <Text
                  className="text-gray-600 mt-4 text-center"
                  style={{
                    marginBottom: screenHeight * 0.01,
                    fontSize: screenWidth * 0.03,
                  }}
                >
                  Slide down to view the results
                </Text>
              </TouchableOpacity>
            </View>
          </Modal> */}
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
