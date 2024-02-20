import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { auth, database } from "../config/firebase";
import { collection, query, where, getDocs,onSnapshot } from 'firebase/firestore';

const ProfileSettingsScreen = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const [profileImage, setProfileImage] = useState(require('../assets/profilepicture.jpg')); // Adjust with your path
    const [completedTasks, setCompletedTasks] = useState(0);
    const [ongoingTasks, setOngoingTasks] = useState(0);

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setUserName(user.displayName || 'Anonymous User');
            setProfileImage(user.photoURL ? { uri: user.photoURL } : require('../assets/profilepicture.jpg')); // Use a default image if no photoURL

            // Fetch projects where the user is a member
            const projectsRef = collection(database, 'projects');
            const q = query(projectsRef, where('members', 'array-contains', user.uid));

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                let _completedTasks = 0;
                let _ongoingTasks = 0;

                querySnapshot.forEach((doc) => {
                    const project = doc.data();
                    project.tasks.forEach((task) => {
                        if (task.assignedTo === user.uid) {
                            if (task.isCompleted) {
                                _completedTasks++;
                            } else {
                                _ongoingTasks++;
                            }
                        }
                    });
                });

                setCompletedTasks(_completedTasks);
                setOngoingTasks(_ongoingTasks);
            });

            return () => unsubscribe(); // Detach the listener when the component unmounts
        }
    }, []);


   /* useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                setUserName(user.displayName || 'Anonymous User');
                setProfileImage(user.photoURL ? { uri: user.photoURL } : require('../assets/profilepicture.jpg')); // Use a default image if no photoURL

                // Fetch projects where the user is a member
                const projectsRef = collection(database, 'projects');
                const q = query(projectsRef, where('members', 'array-contains', user.uid));
                const querySnapshot = await getDocs(q);
                let _completedTasks = 0;
                let _ongoingTasks = 0;

                querySnapshot.forEach((doc) => {
                    const project = doc.data();
                    project.tasks.forEach((task) => {
                        if (task.assignedTo === user.uid) {
                            if (task.isCompleted) {
                                _completedTasks++;
                            } else {
                                _ongoingTasks++;
                            }
                        }
                    });
                });

                setCompletedTasks(_completedTasks);
                setOngoingTasks(_ongoingTasks);
            }
        };

        fetchUserData();
    }, []);*/

    const handleLogout = () => {
        auth.signOut().then(() => navigation.replace('Welcome'));
    };

    return (
        <View style={styles.container}>
            <View style={styles.profileHeader}>
                <Image source={profileImage} style={styles.profileImage} />
                <Text style={styles.userName}>{userName}</Text>
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
    );
};

// Add the rest of your styles here, including the logoutButton style
const styles = StyleSheet.create({
    // your existing styles
    logoutButton: {
        marginTop: 20,
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
    },
    logoutButtonText: {
        color: '#ffffff',
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
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    statBox: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 16,
    },
});

export default ProfileSettingsScreen;
