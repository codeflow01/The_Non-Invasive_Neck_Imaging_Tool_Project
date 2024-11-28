import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { IconButton, MD3Colors } from "react-native-paper";

import { useState } from "react";

export default function featureTBD() {
  return (
    <View className="flex-1 justify-center items-center">
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/featureTBD/featureModal")}
      >
        <IconButton icon="camera" size={80} iconColor={MD3Colors.error30} />
      </TouchableOpacity>
        <Text className="font-bold text-2xl text-red-700">NECK IMAGE PROJECT</Text>
    </View>
  );
}

//   const [isPressed, setIsPressed] = useState<boolean>(false);

//       <TouchableOpacity onPress={() => setIsPressed(!isPressed)}>
//         <Text
//           className={`font-bold ${
//             isPressed ? "text-blue-600" : "text-red-700"
//           } ${isPressed ? "text-4xl" : "text-2xl"}`}
//         >
//           {isPressed ? "Feature TBD" : "NECK IMAGE PROJECT"}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
