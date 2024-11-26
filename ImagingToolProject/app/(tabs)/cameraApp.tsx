import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
  FlashMode,
} from "expo-camera";
import { VideoView, useVideoPlayer } from "expo-video";
import * as MediaLibrary from "expo-media-library";
import { shareAsync } from "expo-sharing";
import { useState, useEffect, useRef } from "react";
import { useEvent } from "expo";

import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text, TouchableOpacity, View } from "react-native";
import * as FileSystem from "expo-file-system";

export default function App() {
  let cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<"front" | "back">("front");
  const [flashMode, setFlashMode] = useState<FlashMode>("off");

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

  //   useEffect(() => {
  //     if (videoUri) {
  //       console.log("(∆π∆) Current video URI:", videoUri);
  //     }
  //   }, [videoUri]);

  //   useEffect(() => {
  //     console.log("(∆π∆) Camera ref current value:", cameraRef.current);
  //   }, [cameraRef.current]);

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
      shareAsync(videoUri).then(() => {
        setTimeout(() => {
          setVideoUri(undefined);
        }, 300);
      });
    };

    let discardVideo = () => {
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
      <SafeAreaView className="flex-1 justify-center">
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
        <Button title="Discard" onPress={discardVideo} />
      </SafeAreaView>
    );
  }

  //   const CameraComponent = forwardRef(({ facing }, ref) => {
  //     const [isActive, setIsActive] = useState(true)
  //     useEffect(() => {
  //       // When component mounts, ensure camera is active
  //       setIsActive(true);
  //       // Cleanup when component unmounts
  //       return () => {
  //         if (cameraRef.current) {
  //           setIsActive(false);
  //         }
  //       };
  //     }, []);
  //     if (!isActive) return null;
  //     return (
  //       <CameraView
  //         style={{ flex: 1 }}
  //         facing={facing}
  //         ref={ref}
  //         mode="video"
  //       />)
  // });

  return (
    <View className="flex-1">
      <View className="h-5/6 w-full">
        <CameraView
          style={{ flex: 1 }}
          facing={facing}
          ref={cameraRef}
          mode="video"
          enableTorch={flashMode === "on"}
        />
      </View>

      {/* <View className="flex-1 justify-center items-end">
        <Button
          title={isRecording ? "Stop Recording" : "Record Video"}
          onPress={isRecording ? stopRecording : recordVideo}
        /> */}
      <View className="">
        <TouchableOpacity
          className="bg-gray-400 px-6 py-3 mt-1 mb-1 ml-36 mr-36 rounded-lg items-center"
          onPress={toggleCameraFacing}
        >
          <Text className="text-red-700 font-semibold text-lg">
            {facing === "front" ? "Back Camera" : "Front Camera"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-400 px-6 py-3 mb-1 ml-36 mr-36 rounded-lg items-center"
          onPress={toggleFlash}
        >
          <Text className="text-red-700 font-semibold text-lg">
            Flash: {flashMode === "off" ? "off" : "on"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-400 px-6 py-3 mb-1 ml-36 mr-36 rounded-lg items-center"
          onPress={isRecording ? stopRecording : recordVideo}
        >
          <Text className="text-red-700 font-semibold text-lg">
            {isRecording ? "Stop Recording" : "Record Video"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
