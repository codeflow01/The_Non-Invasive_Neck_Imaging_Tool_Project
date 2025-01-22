import React, { useState, useEffect } from "react";
import {
  View,
  PanResponder,
  Text,
  Image,
  GestureResponderEvent,
  LayoutChangeEvent,
  Dimensions,
} from "react-native";

interface ROI {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RoiToolProps {
  onRoiSelected: (roi: ROI) => void;
  onCancel: () => void;
  videoWidth: number;
  videoHeight: number;
  imageUri: string;
  containerHeight: number;
}

export default function RoiTool({
  onRoiSelected,
  onCancel,
  videoWidth,
  videoHeight,
  imageUri,
  containerHeight,
}: RoiToolProps) {
  const [roi, setRoi] = useState<ROI>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [completedRoi, setCompletedRoi] = useState<ROI | null>(null);
  const [imageLayout, setImageLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // the scale factor for the displayed roiFrame to maintain aspect ratio
  const getScaledDimensions = () => {
    const aspectRatio = videoWidth / videoHeight;
    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height;

    const availableHeight = containerHeight || screenHeight * 0.8;

    const widthBasedHeight = screenWidth / aspectRatio;
    const heightBasedWidth = availableHeight * aspectRatio;

    // choose the smaller dimension to ensure it fits both dimensions
    let scaledWidth, scaledHeight;
    if (widthBasedHeight <= availableHeight) {
      scaledWidth = screenWidth;
      scaledHeight = widthBasedHeight;
    } else {
      scaledWidth = heightBasedWidth;
      scaledHeight = availableHeight;
    }

    // center the roiFrame on the screen
    const xOffset =
      scaledWidth < screenWidth ? (screenWidth - scaledWidth) / 2 : 0;

    if (scaledHeight > screenHeight) {
      scaledHeight = screenHeight;
      scaledWidth = screenHeight * aspectRatio;
    }

    return {
      width: scaledWidth,
      height: scaledHeight,
      xOffset,
    };
  };

  const {
    width: displayWidth,
    height: displayHeight,
    xOffset,
  } = getScaledDimensions();

  // Convert screen coordinates to upload video coordinates
  const translateCoordinates = (x: number, y: number) => {
    const scaleX = videoWidth / displayWidth;
    const scaleY = videoHeight / displayHeight;

    // Adjust for roiFrame centering
    const adjustedX = x - imageLayout.x - xOffset;
    const adjustedY = y - imageLayout.y;

    // Clamp coordinates to video dimensions
    const translatedX = Math.max(
      0,
      Math.min(Math.round(adjustedX * scaleX), videoWidth)
    );
    const translatedY = Math.max(
      0,
      Math.min(Math.round(adjustedY * scaleY), videoHeight)
    );

    return { x: translatedX, y: translatedY };
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      const { x, y } = translateCoordinates(locationX, locationY);

      setRoi({
        x,
        y,
        width: 0,
        height: 0,
      });
      setIsDrawing(true);
      setCompletedRoi(null);
    },

    onPanResponderMove: (event: GestureResponderEvent) => {
      if (isDrawing) {
        const { locationX, locationY } = event.nativeEvent;
        const currentPoint = translateCoordinates(locationX, locationY);

        setRoi((prev) => {
          // the new ROI based on upload video coordinates
          const newRoi = {
            x: Math.min(prev.x, currentPoint.x),
            y: Math.min(prev.y, currentPoint.y),
            width: Math.abs(currentPoint.x - prev.x),
            height: Math.abs(currentPoint.y - prev.y),
          };

          // check ROI stays within video bounds
          return {
            x: Math.max(0, Math.min(newRoi.x, videoWidth)),
            y: Math.max(0, Math.min(newRoi.y, videoHeight)),
            width: Math.min(newRoi.width, videoWidth - newRoi.x),
            height: Math.min(newRoi.height, videoHeight - newRoi.y),
          };
        });
      }
    },

    onPanResponderRelease: () => {
      setIsDrawing(false);
      if (roi.width > 10 && roi.height > 10) {
        setCompletedRoi(roi);
        onRoiSelected(roi);
      }
    },
  });

  // convert video coordinates back to screen coordinates for display
  const getDisplayRoi = (videoRoi: ROI) => {
    const scaleX = displayWidth / videoWidth;
    const scaleY = displayHeight / videoHeight;

    return {
      x: videoRoi.x * scaleX + imageLayout.x + xOffset,
      y: videoRoi.y * scaleY + imageLayout.y,
      width: videoRoi.width * scaleX,
      height: videoRoi.height * scaleY,
    };
  };

  const RoiRect = ({ roi, isDrawing }: { roi: ROI; isDrawing: boolean }) => {
    const displayRoi = getDisplayRoi(roi);
    return (
      <View
        style={{
          position: "absolute",
          left: displayRoi.x,
          top: displayRoi.y,
          width: displayRoi.width,
          height: displayRoi.height,
          borderWidth: 2,
          borderColor: isDrawing ? "#001e57" : "#00ff00",
          backgroundColor: isDrawing
            ? "rgba(0, 30, 87, 0.2)"
            : "rgba(0, 255, 0, 0.2)",
        }}
      />
    );
  };

  return (
    <View className="flex-1 relative bg-black">
      <View
        className="flex-1 justify-center items-center"
        onLayout={(event: LayoutChangeEvent) => {
          const layout = event.nativeEvent.layout;
          setImageLayout(layout);
        }}
        {...panResponder.panHandlers}
      >
        <Image
          source={{ uri: imageUri }}
          style={{
            width: displayWidth,
            height: displayHeight,
            marginLeft: xOffset,
          }}
        />
        {isDrawing && <RoiRect roi={roi} isDrawing={true} />}
        {completedRoi && !isDrawing && (
          <RoiRect roi={completedRoi} isDrawing={false} />
        )}
      </View>

      <View className="absolute top-4 left-0 right-0 items-center">
        <View className="bg-black/50 px-4 py-2 rounded-lg">
          <Text className="text-white text-base">
            {completedRoi
              ? `Selected ROI: ${Math.round(roi.width)}×${Math.round(
                  roi.height
                )} px`
              : "Draw a rectangle for ROI"}
          </Text>
        </View>
      </View>
    </View>
  );
}
