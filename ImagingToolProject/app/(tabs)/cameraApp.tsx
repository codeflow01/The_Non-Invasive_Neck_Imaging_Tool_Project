import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
  FlashMode,
  FocusMode
} from "expo-camera";
import { VideoView, useVideoPlayer } from "expo-video";
import * as MediaLibrary from "expo-media-library";
import { shareAsync } from "expo-sharing";
import { useState, useEffect, useRef } from "react";
import { useEvent } from "expo";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Text, TouchableOpacity, View } from "react-native";
import * as FileSystem from "expo-file-system";

type VideoQuality = "2160p" | "1080p" | "720p";
type VideoStabilization = "off" | "standard" | "cinematic" | "auto";

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function App() {
  let cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<"front" | "back">("front");
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [videoQuality, setVideoQuality] = useState<VideoQuality>("1080p");
  const [stabilizationMode, setStabilizationMode] =
    useState<VideoStabilization>("auto");
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isAutofocusEnabled, setIsAutofocusEnabled] = useState<FocusMode>("off");


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

  const toggleFlash = () => {
    setFlashMode((current) => (current === "off" ? "on" : "off"));
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

  const toggleMute = () => {
    setIsMuted((current) => !current);
  };

  const toggleAutofocus = () => {
    setIsAutofocusEnabled((current) => current === "off" ? "on" : "off");
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

    let options = {
      maxDuration: 5,
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

        <Button
          title={isPlaying ? "Pause" : "Play"}
          onPress={() => {
            if (isPlaying) {
              player.pause();
            } else {
              player.play();
            }
          }}
        />

        <Button title="Share" onPress={shareVideo} />

        {/* {hasMediaLibPermission ? (
          <Button title="Save" onPress={saveVideo} />
        ) : undefined} */}
        <Button title="Camera" onPress={recordAgain} />
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1">
      <View className="h-3/6 w-full">
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
          
          // zoom={zoom}
        />

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
          <Text className="text-red-700 font-semibold text-lg">
            CAMERA: {facing === "front" ? "BACK" : "FRONT"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-400 px-6 py-3 mb-1 ml-28 mr-28 rounded-lg items-center"
          onPress={toggleVideoQuality}
        >
          <Text className="text-red-700 font-semibold text-lg">
            QUALITY: {videoQuality.toUpperCase()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-400 px-6 py-3 mb-1 ml-28 mr-28 rounded-lg items-center"
          onPress={toggleFlash}
        >
          <Text className="text-red-700 font-semibold text-lg">
            FLASH: {flashMode === "off" ? "OFF" : "ON"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-400 px-6 py-3 mb-1 ml-28 mr-28 rounded-lg items-center"
          onPress={toggleMute}
        >
          <Text className="text-red-700 font-semibold text-lg">
            MUTE: {isMuted ? "OFF" : "ON"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-400 px-6 py-3 mb-1 ml-28 mr-28 rounded-lg items-center"
          onPress={toggleStabilization}
        >
          <Text className="text-red-700 font-semibold text-lg">
            STABILIZATION: {stabilizationMode.toUpperCase()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-400 px-6 py-3 mb-1 ml-28 mr-28 rounded-lg items-center"
          onPress={toggleAutofocus}
        >
          <Text className="text-red-700 font-semibold text-lg">
            AUTO FOCUS: {isAutofocusEnabled ? "ON" : "OFF"}
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
  );
}
