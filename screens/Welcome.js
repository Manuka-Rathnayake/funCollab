import { View, Text, Pressable, Image, SafeAreaView } from 'react-native'
import React from 'react'
import { LinearGradient } from "expo-linear-gradient";
import COLORS from '../constants/colors';
import Button from '../components/Button';

const Welcome = ({ navigation }) => {

    return (
        <SafeAreaView style={{
            flex: 1
        }}>
        <LinearGradient
            style={{
                flex: 1
            }}
            colors={[COLORS.purple, COLORS.blue]}
        >
            <View style={{ flex: 1 }}>
                <View style={{
                        paddingHorizontal: 22,
                        position: "absolute",
                        top: 40,
                        width: "100%",
                        justifyContent: 'center', // Center horizontally
                        alignItems: 'center',
                    }}>
                        <Text style={{
                            fontSize: 50,
                            fontWeight: 800,
                            color: COLORS.white
                        }}>Fun Collab</Text>
                </View>
                <View>
                    <Image
                        source={require("../assets/welcome.jpg")}
                        style={{
                            height:  '60%',
                            width: '95%',
                            borderRadius: 20,
                            alignSelf: 'center',
                            top: 140,
                            resizeMode: 'cover'
                        }}
                    />
                </View>

                <View style={{
                    paddingHorizontal: 22,
                    position: "absolute",
                    top: 480,
                    width: "100%"
                }}>
                    <Text style={{
                        fontSize: 46,
                        fontWeight: 800,
                        color: COLORS.white
                    }}>Let's Get</Text>
                    <Text style={{
                        fontSize: 38,
                        fontWeight: 800,
                        color: COLORS.white
                    }}>Started,</Text>
                    <Text style={{
                        fontSize: 38,
                        fontWeight: 800,
                        color: COLORS.white
                    }}>Collabarating</Text>
                    
                    <Button
                        title="Join Now"
                        onPress={() => navigation.navigate("Signup")}
                        style={{
                            marginTop: 50,
                            width: "100%"
                        }}
                    />

                    <View style={{
                        flexDirection: "row",
                        marginTop: 12,
                        justifyContent: "center"
                    }}>
                        <Text style={{
                            fontSize: 16,
                            color: COLORS.white
                        }}>Already have an account ?</Text>
                        <Pressable
                            onPress={() => navigation.navigate("Login")}
                        >
                            <Text style={{
                                fontSize: 16,
                                color: COLORS.white,
                                fontWeight: "bold",
                                marginLeft: 4
                            }}>Login</Text>
                        </Pressable>

                    </View>
                </View>
            </View>
        </LinearGradient>
    </SafeAreaView>
    )
}

export default Welcome;
