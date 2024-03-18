import React, { useState, useEffect,useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { auth, database } from "../config/firebase";
import { collection, query, where, onSnapshot,doc,getDoc } from 'firebase/firestore';
import { LinearGradient } from "expo-linear-gradient";
import COLORS from '../constants/colors';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const ProfileSettingsScreen = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const [profileImage, setProfileImage] = useState(require('../assets/profilepicture.jpg'));
    const [completedTasks, setCompletedTasks] = useState(0);
    const [ongoingTasks, setOngoingTasks] = useState(0);

    useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <MaterialCommunityIcons name="account" size={24} color={COLORS.purple} />
          <Text style={styles.headerTitleText}>Profile</Text>
        </View>
      ),
      headerStyle: {
        backgroundColor: COLORS.purple, // Adjust the color to your header's background
        elevation: 0, // Removes shadow on Android
        shadowOpacity: 0, // Removes shadow on iOS
      },
      headerTitleAlign: "center",
      headerTitleContainerStyle: {
        left: 0, // Adjust these values to bring the title closer to the center if needed
        right: 0,
      },
    });
  }, [navigation]);

    useEffect(() => {
        const user = auth.currentUser;
        console.log("current user",user);
        if (user) {
            const userDocRef = doc(database, 'users', user.uid);
            getDoc(userDocRef).then((docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setUserName(userData.username || 'Anonymous User');
                } else {
                    setUserName('Anonymous User');
                }
            }).catch((error) => {
                console.error("Error fetching user document:", error);
                setUserName('Anonymous User');
            });
            setProfileImage(user.photoURL ? { uri: user.photoURL } : require('../assets/profilepicture.jpg'));

            const projectsRef = collection(database, 'projects');
            const q = query(projectsRef, where('members', 'array-contains', user.uid));

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                let _completedTasks = 0;
                let _ongoingTasks = 0;

                querySnapshot.forEach((doc) => {
                    const project = doc.data();
                    // Ensure tasks exist and is an array before iterating
                    if (Array.isArray(project.tasks)) {
                        project.tasks.forEach((task) => {
                            if (task.assignedTo === user.uid) {
                                task.isCompleted ? _completedTasks++ : _ongoingTasks++;
                            }
                        });
                    }
                });

                setCompletedTasks(_completedTasks);
                setOngoingTasks(_ongoingTasks);
            });

            return () => unsubscribe();
        }
    }, []);

    const handleLogout = () => {
        auth.signOut().then(() => navigation.replace('Welcome'));
    };

    return (
        <LinearGradient
        style={{
            flex: 1,
            paddingBottom: 250,
        }}
        colors={[COLORS.purple, COLORS.blue]}
    >
        <View style={styles.container}>
            <View style={styles.profileHeader}>
                <Image source={profileImage} style={styles.profileImage} />
                <Text style={styles.userName}>{userName} 🙌</Text>
            </View>
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{completedTasks}</Text>
                    <Text style={styles.statLabel}>Completed Tasks</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{ongoingTasks}</Text>
                    <Text style={styles.statLabel}>Ongoing Tasks</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
        </View>
        </LinearGradient>
    );
};


// Add the rest of your styles here, including the logoutButton style
const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "white", // Adjust if you want a different background for the title
    borderRadius: 30,
    marginHorizontal: 10, // Keeps the header title container within the screen bounds
    alignSelf: "stretch", // Make sure this is set to 'stretch' or just remove it
    width: "100%", // Prevents the title from being too wide on large screens
  },
  headerTitleText: {
    marginLeft: 10,
    color: COLORS.purple, // Adjust the color to match your design
    fontSize: 18, // Adjust the size to match your design
    fontWeight: "bold",
  },
    // your existing styles
    logoutButton: {
        marginTop: 20,
        backgroundColor: 'white',
        //padding: 10,
        paddingVertical: 10,
        paddingHorizontal: 60,
        borderRadius: 20,
        alignSelf: 'center',
    },
    logoutButtonText: {
        color: COLORS.purple,
        fontWeight: 'bold',
        fontSize: 20,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
        color:'white'
    },
    editButton: {
        marginTop: 10,
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
    },
    editButtonText: {
        color: '#ffffff',
    },
    statsContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        alignItems: 'center',
    },
    statBox: {
        alignItems: 'center',
        marginBottom: 10,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color:'white'
    },
    statLabel: {
        fontSize: 18,
        color:'white',
        fontWeight: "bold",
    },
});

export default ProfileSettingsScreen;
