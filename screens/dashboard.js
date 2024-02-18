import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Make sure you have @react-navigation/native installed
import { auth, database } from "../config/firebase";
import { collection, query, where, getDocs } from 'firebase/firestore';

const Dashboard = () => {
    const [userProjects, setUserProjects] = useState([]);
    const navigation = useNavigation(); // Use the useNavigation hook to get the navigation prop

    useEffect(() => {
        const fetchProjects = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                console.error("No user is currently logged in.");
                return;
            }

            // Fetch projects where the user is the owner or a member
            try {
                const projectsRef = collection(database, 'projects');
                const ownedProjectsQuery = query(projectsRef, where('ownerId', '==', currentUser.uid));
                const memberProjectsQuery = query(projectsRef, where('members', 'array-contains', currentUser.uid));

                // Fetch owned projects
                const ownedProjectsSnapshot = await getDocs(ownedProjectsQuery);
                const ownedProjects = ownedProjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Fetch projects where the user is a member
                const memberProjectsSnapshot = await getDocs(memberProjectsQuery);
                const memberProjects = memberProjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Combine both owned and member projects
                setUserProjects([...ownedProjects, ...memberProjects]);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };

        fetchProjects();
    }, []);

    const handleProjectPress = (projectId) => {
        // Navigate to the ProjectScreen with the projectId
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
    // Add more styles as needed
});

export default Dashboard;