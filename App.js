import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import WelcomeScreen from "./screens/WelcomeScreen";
import ProjectScreen from './screens/ProjectScreen';
import Tasks from './Components/ProjectScreen Components/tasks';
import { useFonts } from "expo-font";
import { SafeAreaView } from "react-native";

export default function App() {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Regular": require("./assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("./assets/fonts/Poppins-SemiBold.ttf"),
  });

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <WelcomeScreen/>
      {/*<ProjectScreen />*/} 
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
});
