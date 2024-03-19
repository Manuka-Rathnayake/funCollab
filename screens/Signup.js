import { View, Text, Image, Pressable, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from '../constants/colors';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Checkbox from "expo-checkbox"
import Button from '../components/Button';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../config/firebase";
import { doc, setDoc } from 'firebase/firestore';


const Signup = ({ navigation }) => {
    const [isPasswordShown, setIsPasswordShown] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [uname, setUname] = useState("");

    const isValidEmail = (email) => {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
    };

    const isValidUsername = (username) => {
    const regex = /^[a-z]+$/; // Only lowercase letters, no spaces, numbers, or special characters
    return regex.test(username);
    };


    const isValidPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/; // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
    return regex.test(password);
    };

    const onHandleSignup = async () => {

        if (!isValidEmail(email)) {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
        return; 
        }

        if (!isValidUsername(uname)) {
                Alert.alert("Invalid Username", "Username should contain only lower-letters (no spaces, numbers, or special characters).");
                return;
        }

        if (!isValidPassword(password)) {
            Alert.alert("Invalid Password", "Password must be at least 6 characters long, include at least one uppercase letter, one lowercase letter, and one number.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userRef = doc(database, "users", user.uid);
            await setDoc(userRef, {
                email: email,
                uid: user.uid,
                username: uname,
            });
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
            Alert.alert("Error", "The email address is already in use by another account.");
        } else if (error.code === 'auth/weak-password') {
            Alert.alert("Error", "The password is too weak.");
        } else {
            console.log(error);
            Alert.alert("Error", "An error occurred during sign up.");
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
                <View style={{ flex: 1, marginHorizontal: 22, marginVertical: 25 }}>
                    <View style={{ marginVertical: 22, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{
                            fontSize: 35,
                            fontWeight: 'bold',
                            marginVertical: 12,
                            color: COLORS.white
                        }}>
                            Create Account
                        </Text>

                        <Text style={{
                            width: '100%',
                            fontSize: 16,
                            color: COLORS.white,
                            textAlign: 'center'
                        }}>Connect with your friends today!</Text>
                    </View>
                    <View style={{ marginBottom: 12 }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 400,
                            marginVertical: 8,
                            color: COLORS.white
                        }}>Username</Text>

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
                                placeholder='Enter a username'
                                placeholderTextColor={COLORS.white}
                                style={{
                                    width: "100%",
                                    color: COLORS.white
                                }}
                                value={uname}
                                onChangeText={(text) => setUname(text)}
                            />
                        </View>
                    </View>
                    <View style={{ marginBottom: 12 }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 400,
                            marginVertical: 8,
                            color: COLORS.white
                        }}>Email address</Text>

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
                                placeholder='Enter your email address'
                                placeholderTextColor={COLORS.white}
                                keyboardType='email-address'
                                style={{
                                    width: "100%",
                                    color: COLORS.white
                                }}
                                value={email}
                                onChangeText={(text) => setEmail(text)}
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

                    <Button
                        title="Sign Up"
                        filled
                        style={{
                            marginTop: 18,
                            marginBottom: 4,

                        }}
                        onPress={onHandleSignup}
                    />
                    <View style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        marginVertical: 22
                    }}>
                        <Text style={{ fontSize: 16, color: COLORS.white, flex: 1 }}>Already have an account ?</Text>
                        <Pressable
                            onPress={() => navigation.navigate("Login")}
                        >
                            <Text style={{
                                fontSize: 16,
                                color: COLORS.white,
                                fontWeight: "bold",
                                marginLeft: 6,
                                textAlign: 'center'

                            }}>Login here</Text>
                        </Pressable>
                    </View>
                </View>
            </LinearGradient>
        </SafeAreaView>
    )
}

export default Signup;

























