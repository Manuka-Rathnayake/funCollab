import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet,Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, database } from "../config/firebase";
import { collection, query, where, onSnapshot, doc, deleteDoc,getDoc } from 'firebase/firestore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Dashboard = () => {
    const navigation = useNavigation();
    const [userName, setUserName] = useState('');
    const [ownedProjects, setOwnedProjects] = useState([]);
    const [memberProjects, setMemberProjects] = useState([]);

    useEffect(() => {
        const currentUser = auth.currentUser;
    
        if (currentUser) {
            const userDocRef = doc(database, 'users', currentUser.uid);
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
        }

        const projectsRef = collection(database, 'projects');
        const ownedProjectsQuery = query(projectsRef, where('ownerId', '==', currentUser.uid));
        const memberProjectsQuery = query(projectsRef, where('members', 'array-contains', currentUser.uid));

        const unsubscribeOwned = onSnapshot(ownedProjectsQuery, (snapshot) => {
            const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOwnedProjects(projects);
        });

        const unsubscribeMember = onSnapshot(memberProjectsQuery, (snapshot) => {
            const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMemberProjects(projects.filter(project => project.ownerId !== currentUser.uid));
        });

        return () => {
            unsubscribeOwned();
            unsubscribeMember();
        };
    }, []);

    const handleProjectPress = (projectId) => {
        navigation.navigate('ProjectScreen', { projectId });
    };
    const deleteProject = async (projectId) => {
        const projectRef = doc(database, 'projects', projectId);
        await deleteDoc(projectRef);
        setOwnedProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
    };
    const handleDeletePress = (projectId) => {
        Alert.alert(
            "Delete Project",
            "Are you sure you want to delete this project?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Deletion cancelled"),
                    style: "cancel"
                },
                {
                    text: "OK", onPress: () => deleteProject(projectId)
                }
            ],
            { cancelable: false }
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <Text style={styles.welcomeMessage}>Welcome back 👋{'\n'} {userName}!</Text>
            <Text style={styles.header}>Owned Projects</Text>
            <FlatList
                data={ownedProjects}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.projectItem}>
                        <TouchableOpacity onPress={() => handleProjectPress(item.id)}>
                            <Text style={styles.projectName}>{item.projectName}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeletePress(item.id)} style={styles.deleteButton}>
                            <MaterialCommunityIcons name="delete" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.noProjectsText}>No owned projects</Text>}
            />

            <Text style={styles.header}>Member Projects</Text>
            <FlatList
                data={memberProjects}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleProjectPress(item.id)} style={styles.projectItem}>
                        <Text style={styles.projectName}>{item.projectName}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.noProjectsText}>No invited projects</Text>}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    projectItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    projectName: {
        fontSize: 18,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginLeft: 10,
        textAlign: 'center',
    },
    deleteButton: {
        padding: 5,
        backgroundColor: 'red',
        borderRadius: 5,
        alignSelf: 'flex-end',
        marginTop: -20, // Adjust based on your layout
    },
    noProjectsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: 'grey',
    },
    welcomeMessage: {
        fontSize: 24,
        fontWeight: 'bold',
        margin: 10,
        textAlign: 'center',
    },
});

export default Dashboard;