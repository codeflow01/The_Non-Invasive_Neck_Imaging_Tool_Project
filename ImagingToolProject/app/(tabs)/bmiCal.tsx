import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";

export default function BMICalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmiResult, setBMIResult] = useState<number | null>(null);
  const [bmiCategory, setBMICategory] = useState("");

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const tabBarWidth = screenWidth * 0.85;

  const calculateBMI = () => {
    if (height && weight) {
      const heightInMeters = parseFloat(height) / 100;
      const weightInKg = parseFloat(weight);
      const bmi = weightInKg / (heightInMeters * heightInMeters);
      setBMIResult(parseFloat(bmi.toFixed(1)));

      if (bmi < 18.5) {
        setBMICategory("Underweight");
      } else if (bmi >= 18.5 && bmi < 24.9) {
        setBMICategory("Normal weight");
      } else if (bmi >= 25 && bmi < 29.9) {
        setBMICategory("Overweight");
      } else {
        setBMICategory("Obese");
      }
    }
  };

  const resetCalculator = () => {
    setHeight("");
    setWeight("");
    setBMIResult(null);
    setBMICategory("");
  };

  return (
    <ScrollView contentContainerStyle={{ flex: 1 }}>
      <View
        className="flex-1 items-center justify-center bg-gray-100"
        style={{ padding: screenWidth * 0.08 }}
      >
        <View
          className="bg-white rounded-xl"
          style={{
            width: tabBarWidth,
            padding: screenWidth * 0.05,
          }}
        >
          <Text
            className="font-bold text-center text-[#001e57]"
            style={{
              fontSize: screenWidth * 0.06,
              marginBottom: screenHeight * 0.04,
            }}
          >
            BMI Calculator
          </Text>

          <View style={{ marginBottom: screenHeight * 0.02 }}>
            <Text
              className="text-gray-600"
              style={{
                marginBottom: screenHeight * 0.01,
                fontSize: screenWidth * 0.04,
              }}
            >
              Height (cm)
            </Text>
            <TextInput
              className="w-full border border-gray-200 rounded-lg"
              style={{
                padding: screenWidth * 0.03,
                fontSize: screenWidth * 0.04,
              }}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              // placeholder="Enter height in cm"
            />
          </View>

          <View style={{ marginBottom: screenHeight * 0.02 }}>
            <Text
              className="text-gray-600"
              style={{
                marginBottom: screenHeight * 0.01,
                fontSize: screenWidth * 0.04,
              }}
            >
              Weight (kg)
            </Text>
            <TextInput
              className="w-full border border-gray-200 rounded-lg"
              style={{
                padding: screenWidth * 0.03,
                fontSize: screenWidth * 0.04,
              }}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              // placeholder="Enter weight in kg"
            />
          </View>

          <TouchableOpacity
            onPress={calculateBMI}
            className="items-center bg-[#001e57] rounded-lg shadow-lg"
            style={{ padding: screenWidth * 0.04, marginBottom: screenHeight * 0.02, marginTop: screenHeight * 0.02 }}
          >
            <Text
              className="text-white font-semibold"
              style={{
                fontSize: screenWidth * 0.04,
              }}
            >
              Calculate BMI
            </Text>
          </TouchableOpacity>

          {bmiResult && (
            <View className="items-center">
              <Text
                className="font-bold text-[#001e57]"
                style={{
                  fontSize: screenWidth * 0.06,
                  marginBottom: screenHeight * 0.01,
                }}
              >
                {bmiResult}
              </Text>
              <Text
                className="text-gray-600 text-center"
                style={{
                  fontSize: screenWidth * 0.045,
                  marginBottom: screenHeight * 0.02,
                }}
              >
                {bmiCategory}
              </Text>
              
              <TouchableOpacity
                onPress={resetCalculator}
                className="items-center bg-gray-200 rounded-lg w-full"
                style={{ padding: screenWidth * 0.04 }}
              >
                <Text
                  className="text-gray-700 font-semibold"
                  style={{
                    fontSize: screenWidth * 0.04,
                  }}
                >
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
