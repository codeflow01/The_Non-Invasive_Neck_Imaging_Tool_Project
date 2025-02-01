import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
  LayoutChangeEvent,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import RoiTool from "../../../hooks/useRoiTool";

interface ROI {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DiagnosisResponse {
  success: boolean;
  videoName: string;
  results: {
    displacement_plots: string;
    registration_csv: string;
    avg_csv: string;
  };
  message: string;
}

interface RoiFrameResponse {
  success: boolean;
  roiFrame: string;
  videoWidth: number;
  videoHeight: number;
}

export default function Roi() {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const buttonPadding = screenWidth * 0.04;
  const fontSize = screenWidth * 0.04;
  const iconSize = screenWidth * 0.15;
  const modalPadding = screenWidth * 0.05;

  const [roi, setRoi] = useState<ROI | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [diagnosisResult, setDiagnosisResult] =
    useState<DiagnosisResponse | null>(null);
  const navigation = useNavigation();
  const [containerHeight, setContainerHeight] = useState(0);

  const SERVER_URL = "http://192.168.1.19:8000";

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setContainerHeight(height);
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["roiFrame"],
    queryFn: async (): Promise<RoiFrameResponse> => {
      try {
        const response = await fetch(`${SERVER_URL}/video/roi-frame`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching ROI frame:", error);
        throw error;
      }
    },
  });

  const diagnosisMutation = useMutation({
    mutationFn: async (selectedRoi: ROI) => {
      const response = await fetch(`${SERVER_URL}/diagnosis/cardiac`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedRoi),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json() as Promise<DiagnosisResponse>;
    },
    onSuccess: (result) => {
      if (result.success) {
        setDiagnosisResult(result);
        setShowCompletionModal(true);
      }
    },
    onError: (error) => {
      console.error("Diagnosis error:", error);
      alert("Failed to process diagnosis. Please try again.");
    },
  });

  const handleRoiSelected = (selectedRoi: ROI) => {
    setRoi(selectedRoi);
  };

  const handleConfirm = () => {
    if (!roi) return;
    diagnosisMutation.mutate(roi);
  };

  const handleResultToInsight = () => {
    if (!diagnosisResult?.results) return;
    setShowCompletionModal(false);
    router.replace({
      pathname: "/(tabs)/insight",
      params: {
        displacementPlotsUrl: diagnosisResult.results.displacement_plots,
        regCsvUrl: diagnosisResult.results.registration_csv,
        avgCsvUrl: diagnosisResult.results.avg_csv,
      },
    });
  };

  const handleCancel = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <Text className="text-[#001e57]" style={{ fontSize }}>
          Loading ROI frame...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <Text className="text-red-500" style={{ fontSize }}>
          Failed to load ROI frame. Please check your connection and try again.
        </Text>
        <TouchableOpacity
          onPress={handleCancel}
          className="bg-[#001e57] rounded-lg"
          style={{ padding: buttonPadding, marginTop: screenHeight * 0.02 }}
        >
          <Text className="text-white" style={{ fontSize }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!data) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 justify-center">
        <View className="flex-1 " onLayout={handleLayout}>
          {containerHeight > 0 && (
            <RoiTool
              onRoiSelected={handleRoiSelected}
              onCancel={handleCancel}
              videoWidth={data.videoWidth}
              videoHeight={data.videoHeight}
              imageUri={`${SERVER_URL}${data.roiFrame}`}
              containerHeight={containerHeight}
            />
          )}
        </View>

        <View className="space-y-2" style={{ padding: screenWidth * 0.04 }}>
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!roi || diagnosisMutation.isPending}
            style={{ padding: buttonPadding }}
            className={`rounded-lg flex-row justify-center items-center space-x-2 mb-2 ${
              !roi || diagnosisMutation.isPending
                ? "bg-gray-400"
                : "bg-[#001e57]"
            }`}
          >
            {diagnosisMutation.isPending && (
              <ActivityIndicator size="small" color="white" />
            )}
            <Text className="text-white font-semibold" style={{ fontSize }}>
              {diagnosisMutation.isPending
                ? "Processing..."
                : "Start Diagnosis"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCancel}
            disabled={diagnosisMutation.isPending}
            className="bg-gray-200 rounded-lg"
            style={{ padding: buttonPadding }}
          >
            <Text
              className="text-gray-700 font-semibold text-center"
              style={{ fontSize }}
            >
              {diagnosisResult ? "Close" : "Cancel"}
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          transparent={true}
          visible={showCompletionModal}
          animationType="fade"
          onRequestClose={() => setShowCompletionModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <TouchableOpacity
              onPress={handleResultToInsight}
              activeOpacity={0.7}
              className="bg-white rounded-2xl items-center"
              style={{
                padding: modalPadding,
                marginHorizontal: screenWidth * 0.08,
              }}
            >
              <FontAwesome5
                name="check-circle"
                size={iconSize}
                color="#001e57"
              />
              <Text
                className="text-[#001e57] font-bold mt-4 text-center"
                style={{ fontSize: fontSize * 1.2 }}
              >
                Diagnosis Completed
              </Text>
              <Text
                className="text-gray-600 mt-4 text-center"
                style={{ fontSize }}
              >
                Tap close button view the results
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
