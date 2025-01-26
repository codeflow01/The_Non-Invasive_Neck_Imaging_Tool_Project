import {
  VideoQuality,
  FlashMode,
  VideoStabilization,
  FocusMode,
  CameraRecordingOptions,
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { VideoView, useVideoPlayer } from "expo-video";
import * as MediaLibrary from "expo-media-library";
import { shareAsync } from "expo-sharing";
import { useState, useEffect, useRef } from "react";
import { useEvent } from "expo";
import { SafeAreaView } from "react-native-safe-area-context";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";

import { useRoiBridge } from "../../../hooks/useRoiBridge";

import { Button, Text, TouchableOpacity, View } from "react-native";
import * as FileSystem from "expo-file-system";

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// optical zoom range 0-0.2
const MAX_ZOOM = 0.2;
const SLIDER_WIDTH = 300;

interface ZoomSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

const ZoomSlider = ({ value, onValueChange }: ZoomSliderProps) => {
  const translateX = useSharedValue((value / MAX_ZOOM) * SLIDER_WIDTH);
  const contextX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextX.value = translateX.value;
    })
    .onUpdate((event) => {
      let newValue = contextX.value + event.translationX;

      newValue = Math.max(0, Math.min(newValue, SLIDER_WIDTH));
      translateX.value = newValue;

      const zoomValue = (newValue / SLIDER_WIDTH) * MAX_ZOOM;
      runOnJS(onValueChange)(zoomValue);
    })
    .onEnd(() => {
      translateX.value = withSpring(translateX.value);
    });

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className="absolute bottom-4 left-20 right-20">
      <View className="h-8 justify-center">
        <View className="h-0.5 bg-white rounded-full" />
        <GestureDetector gesture={panGesture}>
          <Animated.View
            className="absolute w-6 h-6 bg-red-700 rounded-full -ml-3"
            style={sliderStyle}
          />
        </GestureDetector>
      </View>
      <Text className="text-white text-center mt-1">
        {`${Math.round((value / MAX_ZOOM) * 100)}%`}
      </Text>
    </View>
  );
};

export default function Camera() {
  const SERVER_URL = "http://192.168.1.19:8000";

  let cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<"front" | "back">("front");
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [videoQuality, setVideoQuality] = useState<VideoQuality>("1080p");
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [stabilizationMode, setStabilizationMode] =
    useState<VideoStabilization>("auto");
  const [isAutofocusEnabled, setIsAutofocusEnabled] =
    useState<FocusMode>("off");
  const [zoom, setZoom] = useState<number>(0);

  const [cameraPermissionRes, requestCameraPermission] = useCameraPermissions();
  const [micPermissionRes, requestMicPermission] = useMicrophonePermissions();
  const [mediaLibPermissionRes, requestMediaLibPermission] =
    MediaLibrary.usePermissions();

  const [hasCameraPermission, setHasCameraPermission] =
    useState<boolean>(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean>(false);
  const [hasMediaLibPermission, setHasMediaLibPermission] =
    useState<boolean>(false);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [videoUri, setVideoUri] = useState<string | undefined>(undefined);

  const { handleRoiFrame, isProcessing } = useRoiBridge({
    SERVER_URL,
    videoUri: videoUri || "",
    onError: (error) => {
      console.error("ROI Bridge error:", error);
      alert("Error processing video. Please try again.");
    },
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const player = useVideoPlayer(videoUri || "", (player) => {
    if (player) {
      player.loop = true;
      // player.play();
    }
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  useEffect(() => {
    (async () => {
      const cameraPermission = await requestCameraPermission();
      const mediaLibPermission = await requestMediaLibPermission();
      const micPermission = await requestMicPermission();

      setHasCameraPermission(cameraPermission.granted);
      setHasMediaLibPermission(mediaLibPermission.granted);
      setHasMicPermission(micPermission.granted);

      console.log("(∆π∆) Permissions set:", {
        camera: cameraPermission.granted,
        mic: micPermission.granted,
        mediaLib: mediaLibPermission.granted,
      });
    })();
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setElapsedTime((time) => time + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setElapsedTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  if (cameraPermissionRes === undefined) {
    return <Text>Requesting camera permission...</Text>;
  } else if (!hasCameraPermission) {
    return <Text>Permission to use the camera has not been granted.</Text>;
  }

  if (micPermissionRes === undefined) {
    return <Text>Requesting microphone permission...</Text>;
  } else if (!hasMicPermission) {
    return <Text>Permission to use the microphone has not been granted.</Text>;
  }

  if (mediaLibPermissionRes === undefined) {
    return <Text>Requesting save permission...</Text>;
  } else if (!hasMediaLibPermission) {
    return <Text>Permission to save was denied.</Text>;
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleVideoQuality = () => {
    setVideoQuality((current) => {
      switch (current) {
        case "2160p":
          return "1080p";
        case "1080p":
          return "720p";
        case "720p":
          return "2160p";
        default:
          return "1080p";
      }
    });
  };

  const toggleFlash = () => {
    setFlashMode((current) => (current === "on" ? "off" : "on"));
  };

  const toggleMute = () => {
    setIsMuted((current) => (current === true ? false : true));
  };

  const toggleStabilization = () => {
    setStabilizationMode((current) => {
      switch (current) {
        case "auto":
          return "off";
        case "off":
          return "standard";
        case "standard":
          return "cinematic";
        case "cinematic":
          return "auto";
        default:
          return "auto";
      }
    });
  };

  const toggleAutofocus = () => {
    setIsAutofocusEnabled((current) => (current === "off" ? "on" : "off"));
  };

  // let recordVideo = async () => {

  //   setIsRecording(true);
  //   let options = {
  //     maxDuration: 5,
  //     codec: "avc1"
  //   };

  //   const recordedVideo = await cameraRef.current?.recordAsync(options);
  //   console.log("(∆π∆) Recorded video:", recordedVideo);

  //   const fileInfo = await FileSystem.getInfoAsync(recordedVideo.uri);
  //   console.log('(∆π∆) Immediate file check:', fileInfo);

  //   if (recordedVideo.uri.toLowerCase().endsWith('.mov')) {
  //     console.log('Converting MOV to MP4...');
  //     const newUri = recordedVideo.uri.replace('.mov', '.mp4');

  //     // Copy and rename
  //     await FileSystem.copyAsync({
  //       from: recordedVideo.uri,
  //       to: newUri
  //     });

  //   // cameraRef.current?.recordAsync(options).then((recordedVideo) => {
  //     // setVideoUri(recordedVideo?.uri);
  //     setVideoUri(newUri);
  //     setIsRecording(false);
  //   }
  //   // });
  // };

  let recordVideo = () => {
    setIsRecording(true);

    let options: CameraRecordingOptions = {
      maxDuration: 10,
      codec: "avc1",
    };

    // const recordedVideo = await cameraRef.current?.recordAsync(options);
    // console.log("(∆π∆) Recorded video:", recordedVideo);

    // const fileInfo = await FileSystem.getInfoAsync(recordedVideo.uri);
    // console.log("(∆π∆) Immediate file check:", fileInfo);

    cameraRef.current?.recordAsync(options).then((recordedVideo) => {
      setVideoUri(recordedVideo?.uri);
      setVideoUri(recordedVideo?.uri);
      setIsRecording(false);
    });
  };

  let stopRecording = () => {
    setIsRecording(false);
    cameraRef.current?.stopRecording();
  };

  if (videoUri) {
    console.log("(∆π∆) URI:", videoUri);

    let shareVideo = () => {
      shareAsync(videoUri);
    };

    let recordAgain = () => {
      setTimeout(() => {
        setVideoUri(undefined);
      }, 300);
    };

    let processVideo = async () => {
      if (!videoUri) {
        alert("No video recorded");
        return;
      }
      await handleRoiFrame();
    };

    // let saveVideo = async () => {
    //   console.log("(∆π∆) Saving video...");
    //   const fileInfo = await FileSystem.getInfoAsync(videoUri);
    //   console.log("File info:", fileInfo);
    //   try {
    //     console.log("(∆π∆) step to SAVE");
    //     await MediaLibrary.saveToLibraryAsync(videoUri);
    //     // MediaLibrary.saveToLibraryAsync(videoUri).then(() => {
    //     setVideoUri(undefined);
    //     console.log("(∆π∆) step 2");
    //     // });
    //   } catch (error) {
    //     console.log("(∆π∆) log error:", error);
    //   }
    // };

    // if (videoUri) {
    //   console.log("(∆π∆) URI:", videoUri);
    //   let saveVideo = async () => {
    //       console.log("(∆π∆) Saving video...");
    //     try {
    //       console.log("(∆π∆) step 1");
    //       const asset = await MediaLibrary.createAssetAsync(videoUri);
    //       // MediaLibrary.saveToLibraryAsync(videoUri).then(() => {
    //         console.log("(∆π∆) step 2, asset created");
    //         const album = await MediaLibrary.getAlbumAsync("NeckImageVideos");
    //         if(album === null){
    //           await MediaLibrary.createAlbumAsync("NeckImageVideos", asset, false);
    //         }else{
    //           await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    //         }
    //       setVideoUri(undefined);
    //       // });
    //     } catch (error) {
    //       console.log("(∆π∆) log error:", error);
    //     }
    //   };

    return (
      <SafeAreaView className="flex-1">
        <VideoView
          style={{ flex: 1 }}
          player={player}
          allowsFullscreen
          allowsPictureInPicture
        />

        {/* <Button
          title={isPlaying ? "Pause" : "Play"}
          onPress={() => {
            if (isPlaying) {
              player.pause();
            } else {
              player.play();
            }
          }}
        /> */}

        <Button title="Share" onPress={shareVideo} />

        {/* {hasMediaLibPermission ? (
          <Button title="Save" onPress={saveVideo} />
        ) : undefined} */}

        {/* <Button title="Camera" onPress={recordAgain} /> */}

        <Button
          title={isProcessing ? "Processing..." : "Confirm and Draw ROI"}
          onPress={processVideo}
          disabled={isProcessing}
        />
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1">
        {/* <View className="h-3/6 w-full"> */}
        <View className="relative flex-1">
          <CameraView
            style={{ flex: 1 }}
            ref={cameraRef}
            mode="video"
            facing={facing}
            videoQuality={videoQuality}
            enableTorch={flashMode === "on"}
            mute={isMuted}
            videoStabilizationMode={stabilizationMode}
            autofocus={isAutofocusEnabled}
            zoom={zoom}
          />

          <ZoomSlider value={zoom} onValueChange={setZoom} />

          {isRecording && (
            <View className="absolute top-20 w-full items-center">
              <View className="bg-black/50 px-4 py-1 rounded-lg">
                <Text className="text-white font-medium text-lg">
                  {formatTime(elapsedTime)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* <TouchableOpacity
          className="bg-gray-400 px-6 py-3 mt-1 mb-1 ml-36 mr-36 rounded-lg items-center"
          onPress={toggleCameraFacing}
        >
          <Text className="text-red-700 font-semibold text-lg">
            {facing === "front" ? "Back Camera" : "Front Camera"}
          </Text>
        </TouchableOpacity>
        
        </CameraView> */}

        {/* <View className="flex-1 justify-center items-end">
        <Button
          title={isRecording ? "Stop Recording" : "Record Video"}
          onPress={isRecording ? stopRecording : recordVideo}
        /> */}

        <View className="">
          <TouchableOpacity
            className="bg-gray-400 px-6 py-3 mt-1 mb-1 ml-28 mr-28 rounded-lg items-center"
            onPress={toggleCameraFacing}
          >
            <Text className="text-[#001e57] font-semibold text-lg">
              CAMERA: {facing === "front" ? "FRONT" : "BACK"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-400 px-6 py-3 mb-1 ml-28 mr-28 rounded-lg items-center"
            onPress={toggleVideoQuality}
          >
            <Text className="text-[#001e57] font-semibold text-lg">
              QUALITY: {videoQuality.toUpperCase()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-400 px-6 py-3 mb-1 ml-28 mr-28 rounded-lg items-center"
            onPress={toggleFlash}
          >
            <Text className="text-[#001e57] font-semibold text-lg">
              FLASH: {flashMode === "off" ? "OFF" : "ON"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-400 px-6 py-3 mb-1 ml-28 mr-28 rounded-lg items-center"
            onPress={toggleMute}
          >
            <Text className="text-[#001e57] font-semibold text-lg">
              MUTE: {isMuted ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-400 px-6 py-3 mb-1 ml-28 mr-28 rounded-lg items-center"
            onPress={toggleStabilization}
          >
            <Text className="text-[#001e57] font-semibold text-lg">
              STABILIZATION: {stabilizationMode.toUpperCase()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-400 px-6 py-3 mb-1 ml-28 mr-28 rounded-lg items-center"
            onPress={toggleAutofocus}
          >
            <Text className="text-[#001e57] font-semibold text-lg">
              AUTO FOCUS: {isAutofocusEnabled === "off" ? "OFF" : "ON"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-400 px-6 py-3 mb-1 ml-28 mr-28 rounded-lg items-center"
            onPress={isRecording ? stopRecording : recordVideo}
          >
            <Text className="text-zinc-50 font-semibold text-lg">
              {isRecording ? "STOP RECORDING" : "RECORD VIDEO"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

//   return (
//     <View>
//       <Text>Modal Content</Text>
//       {/* <Button
//         onPress={() => router.back()}
//         title="Close Modal"
//       /> */}
//     </View>
//   );
// }
