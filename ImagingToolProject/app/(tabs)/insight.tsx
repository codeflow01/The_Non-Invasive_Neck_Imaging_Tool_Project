import {
  View,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { useQuery, useMutation } from "@tanstack/react-query";

interface DiagnosisResults {
  displacement_plot: string;
  registration_data: string;
}

interface DiagnosisResponse {
  success: boolean;
  videoName?: string;
  results?: DiagnosisResults;
  message?: string;
}

const Insight = () => {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const containerWidth = screenWidth * 0.85;

  // VIC
  // const SERVER_URL = "http://192.168.1.19:8000";
  // ABI
  const SERVER_URL = "http://172.23.96.207:8000";
  // const VIDEO_NAME = "1080P_10sec";

  const diagnosisMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${SERVER_URL}/diagnosis/cardiac`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json() as Promise<DiagnosisResponse>;
    },
  });

  const plotQuery = useQuery({
    queryKey: ["plot", diagnosisMutation.data?.success],
    queryFn: async () => {
      if (
        !diagnosisMutation.data?.success ||
        !diagnosisMutation.data?.results
      ) {
        return null;
      }
      const timestamp = Date.now();
      return `${SERVER_URL}${diagnosisMutation.data.results.displacement_plot}?t=${timestamp}`;
    },
    enabled: diagnosisMutation.isSuccess && diagnosisMutation.data.success,
  });

  const handlePress = () => {
    diagnosisMutation.mutate();
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View
        className="flex-1 items-center justify-center bg-gray-100"
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
            className="font-bold text-center text-[#001e57]"
            style={{
              fontSize: screenWidth * 0.06,
              marginBottom: screenHeight * 0.02,
            }}
          >
            Test UI
          </Text>

          <TouchableOpacity
            className={`items-center rounded-lg shadow-lg ${
              diagnosisMutation.isPending ? "bg-gray-400" : "bg-[#001e57]"
            }`}
            style={{
              padding: screenWidth * 0.04,
              marginBottom: screenHeight * 0.02,
            }}
            onPress={handlePress}
            disabled={diagnosisMutation.isPending}
          >
            <Text
              className="text-white font-semibold"
              style={{
                fontSize: screenWidth * 0.04,
              }}
            >
              {diagnosisMutation.isPending
                ? "Processing..."
                : "Start Diagnosis"}
            </Text>
          </TouchableOpacity>

          {diagnosisMutation.isPending && (
            <View
              className="items-center"
              style={{ marginTop: screenHeight * 0.02 }}
            >
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text
                className="text-gray-600"
                style={{
                  fontSize: screenWidth * 0.04,
                  marginTop: screenHeight * 0.01,
                }}
              >
                Processing video...
              </Text>
            </View>
          )}

          {diagnosisMutation.isError && (
            <Text
              className="text-red-500 text-center"
              style={{
                fontSize: screenWidth * 0.04,
                marginTop: screenHeight * 0.02,
              }}
            >
              Error: {diagnosisMutation.error.message}
            </Text>
          )}

          {diagnosisMutation.isSuccess && !diagnosisMutation.data.success && (
            <Text
              className="text-red-500 text-center"
              style={{
                fontSize: screenWidth * 0.04,
                marginTop: screenHeight * 0.02,
              }}
            >
              {diagnosisMutation.data.message ||
                "Video processing failed. Please try again."}
            </Text>
          )}

          {plotQuery.isSuccess && plotQuery.data && (
            <View>
              <Text
                className="text-[#001e57] text-center"
                style={{
                  fontSize: screenWidth * 0.045,
                  marginTop: screenHeight * 0.02,
                  marginBottom: screenHeight * 0.02,
                }}
              >
                Analysis completed successfully.
              </Text>

              <View
                className="bg-gray-100 rounded-lg overflow-hidden"
                style={{
                  aspectRatio: 16 / 9,
                  marginBottom: screenHeight * 0.02,
                }}
              >
                <Image
                  source={{ uri: plotQuery.data }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>

              {diagnosisMutation.data?.results?.registration_data && (
                <Text
                  className="text-gray-600 text-center"
                  style={{
                    fontSize: screenWidth * 0.035,
                  }}
                >
                  CSV file exported successfully.
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default Insight;
