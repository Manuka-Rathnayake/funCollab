import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { auth, database } from "../config/firebase";
import { doc, setDoc, collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';

const CreateProjectForm = ({ navigation }) => {
    const [projectName, setProjectName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [username, setUsername] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [invitedMembers, setInvitedMembers] = useState([]);

    const searchUsersByUsername = async () => {
        if (!username.trim()) return;
        try {
            const usersRef = collection(database, 'users');
            const q = query(usersRef, where('username', '==', username.trim()));
            const querySnapshot = await getDocs(q);

            const users = querySnapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            }));

            setSearchResults(users);
        } catch (error) {
            console.error("Error searching users by username:", error);
        }
    };

    const handleSelectUser = (user) => {
        if (!invitedMembers.some(member => member.uid === user.uid)) {
            const updatedMembers = [...invitedMembers, user];
            setInvitedMembers(updatedMembers);
        }
    };

    const handleSubmit = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.error("No user is currently logged in.");
            return;
        }

        try {
            const projectRef = doc(database, 'projects', `${currentUser.uid}_${new Date().getTime()}`);
            const memberUids = invitedMembers.map(user => user.uid);

            await setDoc(projectRef, {
                projectName,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                ownerId: currentUser.uid,
                members: memberUids,
            });

            navigation.navigate('Dashboard');
        } catch (error) {
            console.error("Error creating project: ", error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.headerText}>Create your project</Text>
            <TextInput
                style={styles.input}
                placeholder="Project name"
                value={projectName}
                onChangeText={setProjectName}
            />
            <TextInput
                style={styles.input}
                placeholder="Start date"
                value={startDate}
                onChangeText={setStartDate}
            />
            <TextInput
                style={styles.input}
                placeholder="End date"
                value={endDate}
                onChangeText={setEndDate}
            />
            <TextInput
                style={styles.input}
                placeholder="Invite friends by username"
                value={username}
                onChangeText={setUsername}
            />
            <TouchableOpacity style={styles.button} onPress={searchUsersByUsername}>
                <Text style={styles.buttonText}>Search Users</Text>
            </TouchableOpacity>
            {searchResults.map((item) => (
                <TouchableOpacity key={item.uid} style={styles.userItem} onPress={() => handleSelectUser(item)}>
                    <Text style={styles.userItemText}>{item.username}</Text>
                </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    headerText: {
        fontSize: 24,
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    userItem: {
        backgroundColor: '#f9f9f9',
        padding: 10,
        marginBottom: 5,
        borderRadius: 5,
    },
    userItemText: {
        fontSize: 16,
    },
});

export default CreateProjectForm;
