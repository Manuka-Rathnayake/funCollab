import { View, Text, Image, Pressable, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from '../constants/colors';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Checkbox from "expo-checkbox"
import Button from '../components/Button';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../config/firebase";
import { Alert } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { sendPasswordResetEmail } from "firebase/auth";

const Login = ({ navigation }) => {
    const [isPasswordShown, setIsPasswordShown] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [password, setPassword] = useState("");
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [resetEmail, setResetEmail] = useState('');

    const isValidEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };


    const handlePasswordReset = async (email) => {
        if (!email) {
            Alert.alert('Missing Email', 'Please enter your email address to reset your password.');
            return;
        }

        if (!isValidEmail(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert('Check your email', 'A link to reset your password has been sent to your email address.');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to send password reset email. Please try again later.');
        }
    };

const onHandleLogin = async () => {
    if (!emailOrUsername || !password) {
        Alert.alert("Login Error", "Please enter both an email/username and a password.");
        return;
    }

    const isEmail = emailOrUsername.includes('@');

    try {
        if (isEmail) {
            await signInWithEmailAndPassword(auth, emailOrUsername, password);
            console.log("Login success");
            navigation.navigate('Dashboard');
        } else {
            const usersRef = collection(database, "users");
            const q = query(usersRef, where("username", "==", emailOrUsername));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userEmail = userDoc.data().email;
                await signInWithEmailAndPassword(auth, userEmail, password);
                console.log("Login success");
                navigation.navigate('Dashboard');
            } else {
                Alert.alert("Login Error", "No user found with this username.");
            }
        }
    } catch (error) {
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/invalid-credential':
                Alert.alert("Login Error", "The email or password is incorrect. Please try again.");
                break;
            case 'auth/invalid-email':
                Alert.alert("Login Error", "The email address is not valid.");
                break;
            default:
                Alert.alert("Login Error", "An unexpected error occurred. Please try again later.");
                console.log(error);
                break;
        }
    }
};


    return (
        <SafeAreaView style={{ flex: 1 }}>
            <LinearGradient
                style={{
                    flex: 1
                }}
                colors={[COLORS.purple, COLORS.blue]}
            >
                <View style={{ flex: 1, marginHorizontal: 22, }}>
                    <View style={{
                        marginVertical: 29, justifyContent: 'center', alignItems: 'center'
                    }}>
                        <Text style={{
                            fontSize: 28,
                            fontWeight: 'bold',
                            marginVertical: 12,
                            color: COLORS.white
                        }}>
                            Hi Welcome Back ! 👋
                        </Text>

                        <Text style={{
                            fontSize: 16,
                            color: COLORS.white,
                            marginHorizontal: 2,
                        }}>You have been missed!</Text>
                    </View>

                    <View style={{ marginBottom: 12 }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 400,
                            marginVertical: 8,
                            color: COLORS.white
                        }}>Email address / Username</Text>

                        <View style={{
                            width: "100%",
                            height: 48,
                            borderColor: COLORS.white,
                            borderWidth: 1,
                            borderRadius: 8,
                            alignItems: "center",
                            justifyContent: "center",
                            paddingLeft: 22
                        }}>
                            <TextInput
                                placeholder='Enter your email or username'
                                placeholderTextColor={COLORS.white}
                                keyboardType='email-address'
                                style={{
                                    width: "100%",
                                    color: COLORS.white
                                }}
                                value={emailOrUsername}
                                onChangeText={(text) => setEmailOrUsername(text)}
                            />
                        </View>
                    </View>

                    <View style={{ marginBottom: 12 }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 400,
                            marginVertical: 8,
                            color: COLORS.white
                        }}>Password</Text>

                        <View style={{
                            width: "100%",
                            height: 48,
                            borderColor: COLORS.white,
                            borderWidth: 1,
                            borderRadius: 8,
                            alignItems: "center",
                            justifyContent: "center",
                            paddingLeft: 22
                        }}>
                            <TextInput
                                placeholder='Enter your password'
                                placeholderTextColor={COLORS.white}
                                secureTextEntry={!isPasswordShown}
                                style={{
                                    width: "100%",
                                    color: COLORS.white
                                }}
                                value={password}
                                onChangeText={(text) => setPassword(text)}
                            />

                            <TouchableOpacity
                                onPress={() => setIsPasswordShown(!isPasswordShown)}
                                style={{
                                    position: "absolute",
                                    right: 12
                                }}
                            >
                                {
                                    isPasswordShown == false ? (
                                        <Ionicons name="eye-off" size={24} color={COLORS.white} />
                                    ) : (
                                        <Ionicons name="eye" size={24} color={COLORS.white} />
                                    )
                                }

                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => handlePasswordReset(emailOrUsername)}
                        style={{ alignItems: 'flex-end', marginBottom: 10 }} // Inline style for TouchableOpacity
                    >
                        <Text style={{ color: COLORS.white }}>Forgot Password?</Text> 
                    </TouchableOpacity>
                    <Button
                        title="Login"
                        filled
                        style={{
                            marginTop: 18,
                            marginBottom: 4,
                        }}
                        onPress={onHandleLogin}
                    />

                    <View style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        marginVertical: 22
                    }}>
                        <Text style={{ fontSize: 16, color: COLORS.white }}>Don't have an account ? </Text>
                        <Pressable
                            onPress={() => navigation.navigate("Signup")}
                        >
                            <Text style={{
                                fontSize: 16,
                                color: COLORS.white,
                                fontWeight: "bold",
                                marginLeft: 6
                            }}>Register</Text>
                        </Pressable>
                    </View>
                </View>
            </LinearGradient>
        </SafeAreaView>
    )
}

export default Login;


















