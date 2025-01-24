import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import ImageViewer from "react-native-image-zoom-viewer";

interface Params {
  displacementPlotsUrl: string;
  regCsvUrl: string;
  avgCsvUrl: string;
}

export default function Insight() {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const containerWidth = screenWidth * 0.85;
  const params = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // VIC
  const SERVER_URL = "http://192.168.1.19:8000";
  // ABI
  // const SERVER_URL = "http://172.23.23.251:8000";

  const displacementPlotsUrl = params.displacementPlotsUrl;
  const regCsvUrl = params.regCsvUrl;
  const avgCsvUrl = params.avgCsvUrl;

  const displacementPlotsQuery = useQuery({
    queryKey: ["oriPlot", displacementPlotsUrl],
    queryFn: async () => {
      const url = `${SERVER_URL}${displacementPlotsUrl}`;
      return url;
    },
    enabled: displacementPlotsUrl !== undefined,
  });

  const isLoading = displacementPlotsQuery.isLoading;

  const images = displacementPlotsQuery.data
    ? [{ url: displacementPlotsQuery.data }]
    : [];

  const handleNavigateToImaging = () => {
    router.push("/(tabs)/imaging");
  };

  return (
    <ScrollView contentContainerStyle={{ flex: 1 }}>
      <View
        className="flex-1 bg-gray-100 justify-center items-center"
        style={{ padding: screenWidth * 0.08 }}
      >
        <View
          className="bg-white rounded-xl"
          style={{
            width: containerWidth,
            padding: screenWidth * 0.05,
          }}
        >
          <Text
            className="text-[#001e57] font-bold text-center mb-6"
            style={{
              fontSize: screenWidth * 0.06,
              marginBottom: screenHeight * 0.04,
            }}
          >
            Diagnosis Results
          </Text>

          {isLoading ? (
            <View className="items-center justify-center p-8">
              <ActivityIndicator size="large" color="#001e57" />
              <Text
                className="text-gray-600 mt-4 text-center"
                style={{ fontSize: screenWidth * 0.04 }}
              >
                Loading diagnosis results...
              </Text>
            </View>
          ) : displacementPlotsQuery.data ? (
            <View>
              <TouchableOpacity
                className="bg-gray-50 rounded-lg mb-4"
                onPress={() => setImageModalVisible(true)}
              >
                <View className="mb-4">
                  <Text
                    className="text-gray-600 mb-4 mt-4 text-center"
                    style={{ fontSize: screenWidth * 0.03 }}
                  >
                    Displacement Plots
                  </Text>
                  <Image
                    source={{ uri: displacementPlotsQuery.data }}
                    style={{
                      width: "100%",
                      height: screenWidth * 0.6,
                    }}
                    resizeMode="contain"
                  />
                </View>

                <Text
                  className="text-gray-600 text-center mb-4"
                  style={{ fontSize: screenWidth * 0.03 }}
                >
                  Tap to zoom the results
                </Text>
              </TouchableOpacity>

              <Modal
                animationType="slide"
                visible={imageModalVisible}
                transparent={true}
                onRequestClose={() => setImageModalVisible(false)}
              >
                <View
                  className=" bg-black"
                  style={{ flex: 1, paddingTop: screenHeight * 0.02 }}
                >
                  <ImageViewer
                    imageUrls={images}
                    enableSwipeDown={true}
                    onSwipeDown={() => setImageModalVisible(false)}
                    enableImageZoom={true}
                    saveToLocalByLongPress={false}
                  />
                  <View className="absolute bottom-8 left-0 right-0 px-8">
                    <TouchableOpacity
                      className="bg-white rounded-lg shadow-lg"
                      style={{
                        padding: screenWidth * 0.04,
                      }}
                      onPress={() => setImageModalVisible(false)}
                    >
                      <Text
                        className="text-black text-center font-semibold"
                        style={{
                          fontSize: screenWidth * 0.04,
                        }}
                      >
                        Close
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {/* <TouchableOpacity
                    onPress={() => setImageModalVisible(false)}
                    className="absolute top-12 right-4 bg-black/50 rounded-full p-2"
                  >
                    <Text className="text-white font-bold text-lg">✕</Text>
                  </TouchableOpacity> */}
                </View>
              </Modal>

              {(regCsvUrl || avgCsvUrl) && (
                <View className="mt-4">
                  <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="bg-[#001e57] rounded-lg shadow-lg"
                    style={{
                      padding: screenWidth * 0.04,
                      marginBottom: screenHeight * 0.02,
                    }}
                  >
                    <Text
                      className="text-white text-center font-semibold"
                      style={{
                        fontSize: screenWidth * 0.04,
                      }}
                    >
                      More Information
                    </Text>
                  </TouchableOpacity>
                  <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                  >
                    <View className="flex-1 justify-center items-center bg-black/50">
                      <View className="bg-white rounded-xl p-6 m-5 w-4/5">
                        <Text
                          className="text-gray-600 text-center mb-4"
                          style={{ fontSize: screenWidth * 0.035 }}
                        >
                          Data sets have been exported to csv files
                        </Text>
                        <TouchableOpacity
                          className="bg-[#001e57] rounded-lg shadow-lg"
                          style={{
                            padding: screenWidth * 0.04,
                            marginTop: screenHeight * 0.02,
                          }}
                          onPress={() => setModalVisible(false)}
                        >
                          <Text
                            className="text-white text-center font-semibold"
                            style={{
                              fontSize: screenWidth * 0.04,
                            }}
                          >
                            Close
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleNavigateToImaging}
              className="bg-red-700 rounded-lg shadow-lg"
              style={{
                padding: screenWidth * 0.04,
                marginBottom: screenHeight * 0.02,
              }}
            >
              <Text
                className="text-white text-center font-semibold"
                style={{
                  fontSize: screenWidth * 0.04,
                }}
              >
                Please run the Diagnosis first
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
