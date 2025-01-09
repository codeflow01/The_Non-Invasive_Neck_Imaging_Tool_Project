import { Tabs } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Dimensions } from "react-native";

export default function TabLayout() {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#001e57",
        tabBarInactiveTintColor: "#9E9E9E",
        tabBarStyle: {
          height: screenHeight * 0.08,
          width: screenWidth * 0.85,
          paddingBottom: screenHeight * 0.01,
          paddingTop: screenHeight * 0.01,
          backgroundColor: "white",
          position: "relative",
          bottom: screenHeight * 0.04,
          alignSelf: "center",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: screenWidth * 0.04,
          borderTopWidth: 0,
          elevation: 3,
          // shadowColor: "#000",
          // shadowOffset: {
          //   width: 0,
          //   height: 2,
          // },
          // shadowOpacity: 0.1,
          // shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: screenWidth * 0.03,
          marginTop: screenHeight * 0.005,
        },
        tabBarIconStyle: {
          width: screenWidth * 0.06,
          height: screenWidth * 0.06,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Formula",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="watchman-monitoring" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="imaging"
        options={{
          title: "Diagnosis",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="cloudsmith" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="insight"
        options={{
          title: "Insight",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="hubspot" size={24} color={color} />
          ),
        }}
      />

      {/* <Tabs.Screen
        name="beta"
        options={{
          title: "Python_Server",
          headerShown: false,
          tabBarIcon: ({color}) => (
            <FontAwesome5 name="connectdevelop" size={24} color={color} />
          ),
        }}
      /> */}

      <Tabs.Screen
        name="bmiCal"
        options={{
          title: "BMI",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="calculator" size={24} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}

{
  /* hubspot
      cloudsmith
      laptop-medical
      hand-holding-medical
      ello
      */
}
