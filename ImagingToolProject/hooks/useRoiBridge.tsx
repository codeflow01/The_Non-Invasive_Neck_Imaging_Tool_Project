import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Dimensions } from "react-native";

export interface VideoUploadResponse {
  success: boolean;
  message: string;
  filename: string;
  path: string;
}

export interface RoiFrame {
  success: boolean;
  roiFrame: string;
  message: string;
}

export interface RoiBridgeProps {
  SERVER_URL: string;
  videoUri: string;
  onError: (error: Error) => void;
}

export const useRoiBridge = ({
  SERVER_URL,
  videoUri,
  onError,
}: RoiBridgeProps) => {
  const videoUploadMutation = useMutation({
    mutationFn: async (uri: string) => {
      const formData = new FormData();
      const videoUpload = {
        uri,
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
      return response.json() as Promise<VideoUploadResponse>;
    },
  });

  const roiFrameMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${SERVER_URL}/video/roi-frame`);
      if (!response.ok) {
        throw new Error("Failed to get ROI frame");
      }
      return response.json() as Promise<RoiFrame>;
    },
  });

  const handleRoiFrame = async () => {
    try {
      const uploadResult = await videoUploadMutation.mutateAsync(videoUri);
      if (uploadResult.success) {
        const roiFrameResult = await roiFrameMutation.mutateAsync();
        if (roiFrameResult.success) {
          router.push({
            pathname: "./roi",
            params: {
              videoUri: videoUri,
              roiFrame: `${SERVER_URL}${roiFrameResult.roiFrame}`,
              screenWidth: Dimensions.get("window").width,
              screenHeight: Dimensions.get("window").height,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      onError?.(error as Error);
    }
  };

  return {
    handleRoiFrame,
    isProcessing: videoUploadMutation.isPending || roiFrameMutation.isPending,
  };
};
