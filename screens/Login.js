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

const Login = ({ navigation }) => {
    const [isPasswordShown, setIsPasswordShown] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [password, setPassword] = useState("");
    const [emailOrUsername, setEmailOrUsername] = useState("");

    const onHandleLogin = async () => {
        if (emailOrUsername !== "" && password !== "") {
            const isEmail = emailOrUsername.includes('@');

            if (isEmail) {
                signInWithEmailAndPassword(auth, emailOrUsername, password)
                    .then(() => {
                        console.log("Login success");
                        navigation.navigate('Dashboard');
                    })
                    .catch((err) => Alert.alert("Login error", err.message));
            } else {
                const usersRef = collection(database, "users");
                const q = query(usersRef, where("username", "==", emailOrUsername));

                getDocs(q).then((querySnapshot) => {
                    if (!querySnapshot.empty) {
                        const userDoc = querySnapshot.docs[0];
                        const userEmail = userDoc.data().email;

                        signInWithEmailAndPassword(auth, userEmail, password)
                            .then(() => {
                                console.log("Login success");
                                navigation.navigate('Dashboard');
                            })
                            .catch((err) => Alert.alert("Login error", err.message));
                    } else {
                        Alert.alert("Login error", "No user found with this username.");
                    }
                }).catch((err) => {
                    Alert.alert("Login error", err.message);
                });
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

export default Login

























/*import { View, Text, Image, Pressable, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from '../constants/colors';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Checkbox from "expo-checkbox"
import Button from '../components/Button';

const Login = ({ navigation }) => {
    const [isPasswordShown, setIsPasswordShown] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

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
                            fontSize: 22,
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
                        }}>Hello again you have been missed!</Text>
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
                                secureTextEntry={isPasswordShown}
                                style={{
                                    width: "100%"
                                }}
                            />

                            <TouchableOpacity
                                onPress={() => setIsPasswordShown(!isPasswordShown)}
                                style={{
                                    position: "absolute",
                                    right: 12
                                }}
                            >
                                {
                                    isPasswordShown == true ? (
                                        <Ionicons name="eye-off" size={24} color={COLORS.white} />
                                    ) : (
                                        <Ionicons name="eye" size={24} color={COLORS.white} />
                                    )
                                }

                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        marginVertical: 6
                    }}>
                        <Checkbox
                            style={{ marginRight: 8 }}
                            value={isChecked}
                            onValueChange={setIsChecked}
                            color={isChecked ? COLORS.purple : undefined}
                        />

                        <Text Text style={{ color: COLORS.white }}>Remenber Me</Text>
                    </View>

                    <Button
                        title="Login"
                        filled
                        style={{
                            marginTop: 18,
                            marginBottom: 4,
                        }}
                    />

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                        <View
                            style={{
                                flex: 1,
                                height: 1,
                                backgroundColor: COLORS.grey,
                                marginHorizontal: 10
                            }}
                        />
                        <Text style={{ fontSize: 14, color: COLORS.white }}>Or Login with</Text>
                        <View
                            style={{
                                flex: 1,
                                height: 1,
                                backgroundColor: COLORS.grey,
                                marginHorizontal: 10
                            }}
                        />
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center'
                    }}>
                        <TouchableOpacity
                            onPress={() => console.log("Pressed")}
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row',
                                height: 52,
                                borderWidth: 1,
                                borderColor: COLORS.grey,
                                marginRight: 4,
                                borderRadius: 10
                            }}
                        >
                            <Image
                                source={require("../assets/facebook.png")}
                                style={{
                                    height: 36,
                                    width: 36,
                                    marginRight: 8,
                                }}
                                resizeMode='contain'
                            />

                            <Text style={{ color: COLORS.white }}>Facebook</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => console.log("Pressed")}
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row',
                                height: 52,
                                borderWidth: 1,
                                borderColor: COLORS.grey,
                                marginRight: 4,
                                borderRadius: 10
                            }}
                        >
                            <Image
                                source={require("../assets/google.png")}
                                style={{
                                    height: 30,
                                    width: 30,
                                    marginRight: 8
                                }}
                                resizeMode='contain'
                            />

                            <Text Text style={{ color: COLORS.white }}>Google</Text>
                        </TouchableOpacity>
                    </View>

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

export default Login

*/