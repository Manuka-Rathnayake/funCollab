import * as React from "react";
import { StyleSheet, View, Text, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Border, FontFamily, Color, FontSize } from "../GlobalStyles";

const WelcomeScreen = () => {
  return (
    <SafeAreaView style={styles.mainContainer}>
      <LinearGradient
        style={styles.welcomeLayout}
        locations={[0, 0.99]}
        colors={["#524fef", "#8153fc"]}
      >
          <View style={styles.container}>
            <View style={[styles.androidSmall2Child, styles.androidLayout]}/>
            <View style={[styles.androidSmall2Item, styles.androidLayout]}/>
            <Text style={styles.signUp}>SIGN UP</Text>
            <Text style={[styles.signIn, styles.funTypo]}>Sign In</Text>
          </View>
          <Text style={[styles.fun, styles.funTypo]}>{`FUN `}</Text>
          <Text style={[styles.collab, styles.funTypo]}>collab</Text>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  mainContainer:{
    flex:1,
    width: "100%",
    height: "100%",
  },
  welcomeLayout: {
    flex: 1,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: "transparent",
    flexDirection: 'column',
  },
  container:{
    flex:1,
    marginLeft: 8,
  },
  fun: {
    top: 132,
    left: 58,
    fontSize: 105,
    width: '65%',
    height: 115,
    color: Color.colorWhite,
  },
  collab: {
    top: 240,
    fontSize: 59,
    width: 185,
    height: 93,
    color: Color.colorWhite,
    left: 153,
    textAlign: "center",
  },
  funTypo: {
    textAlign: "center",
    fontFamily: FontFamily.poppinsRegular,
    position: "absolute",
  },
  signUp: {
    top: 572,
    textAlign: "left",
    width: 192,
    height: 33,
    color: Color.colorWhite,
    fontFamily: FontFamily.poppinsRegular,
    fontSize: FontSize.size_xl,
    left: 153,
    position: "absolute",
  },
  signIn: {
    top: 660,
    left: 90,
    color: "#524fef",
    width: 191,
    height: 37,
    fontSize: FontSize.size_xl,
    textAlign: "center",
  },
  androidSmall2Child: {
    top: 562,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderStyle: "solid",
    borderColor: Color.colorWhite,
    borderWidth: 3,
  },
  androidSmall2Item: {
    top: 648,
    backgroundColor: Color.colorWhite,
  },
  androidLayout: {
    height: 53,
    width: 275,
    borderRadius: Border.br_11xl,
    left: 53,
    position: "absolute",
  },
})


export default WelcomeScreen;



