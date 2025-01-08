import {
  View,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
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
    <View className="flex-1 justify-center">
      <TouchableOpacity
        className={`ml-20 mr-20 p-3 rounded-lg items-center ${
          diagnosisMutation.isPending
            ? "bg-[#001e57]"
            : "bg-[#001e57] active:bg-blue-600"
        }`}
        onPress={handlePress}
        disabled={diagnosisMutation.isPending}
      >
        <Text className="text-white font-semibold text-lg">
          {diagnosisMutation.isPending ? "Processing..." : "Start Diagnosis"}
        </Text>
      </TouchableOpacity>

      {diagnosisMutation.isPending && (
        <View className="mt-20 items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-2 text-gray-600">Processing video...</Text>
        </View>
      )}

      {diagnosisMutation.isError && (
        <Text className="mt-20 text-red-500 text-center">
          Error: {diagnosisMutation.error.message}
        </Text>
      )}

      {diagnosisMutation.isSuccess && !diagnosisMutation.data.success && (
        <Text className="mt-20 text-red-500 text-center">
          {diagnosisMutation.data.message ||
            "Video processing failed. Please try again."}
        </Text>
      )}

      {plotQuery.isSuccess && plotQuery.data && (
        <View>
          <Text className="mt-20 mb-4 text-[#001e57] text-center text-lg">
            Analysis completed successfully.
          </Text>
          <View className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
            <Image
              source={{ uri: plotQuery.data }}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
          {diagnosisMutation.data?.results?.registration_data && (
            <Text className="mt-4 text-center text-gray-600">
              CSV file exported successfully.
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default Insight;
