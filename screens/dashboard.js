import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, database } from "../config/firebase";
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const Dashboard = () => {
    const [userProjects, setUserProjects] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.error("No user is currently logged in.");
            return;
        }


        const projectsRef = collection(database, 'projects');
        const ownedProjectsQuery = query(projectsRef, where('ownerId', '==', currentUser.uid));
        const memberProjectsQuery = query(projectsRef, where('members', 'array-contains', currentUser.uid));

        // Combine queries using onSnapshot for real-time updates
        const unsubscribeOwned = onSnapshot(ownedProjectsQuery, (snapshot) => {
            const ownedProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUserProjects(prevProjects => {
                const allProjects = [...ownedProjects, ...prevProjects.filter(project => project.ownerId !== currentUser.uid)];
                return allProjects;
            });
        });

        const unsubscribeMember = onSnapshot(memberProjectsQuery, (snapshot) => {
            const memberProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setUserProjects(prevProjects => {
                const allProjects = [...prevProjects.filter(project => !memberProjects.some(mp => mp.id === project.id)), ...memberProjects];
                return allProjects;
            });
        });

        return () => {
            unsubscribeOwned();
            unsubscribeMember();
        };
    }, []);

    const handleProjectPress = (projectId) => {
        navigation.navigate('ProjectScreen', { projectId });
    };

    return (
        <FlatList
            data={userProjects}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleProjectPress(item.id)}>
                    <View style={styles.projectItem}>
                        <Text style={styles.projectName}>{item.projectName}</Text>
                    </View>
                </TouchableOpacity>
            )}
        />
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
});

export default Dashboard;