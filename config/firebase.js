// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth,getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
const firebaseConfig = {
    apiKey: "AIzaSyBjtvyJ2S8gz52tBUcKcT6--NwxaQlH02E",

    authDomain: "funcollab-7feba.firebaseapp.com",

    projectId: "funcollab-7feba",

    storageBucket: "funcollab-7feba.appspot.com",

    messagingSenderId: "60224387099",

    appId: "1:60224387099:web:8c6becddf1290e7613e0be"

}; 

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
//export const auth = getAuth();
export const database = getFirestore();

export { auth };
