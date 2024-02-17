import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { auth, database } from "../config/firebase";
import ProjectFormHeader from '../components/ProjectFormHeader';
import { doc, setDoc, collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';

const CreateProjectForm = ({ navigation }) => {
    const [projectName, setProjectName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [email, setEmail] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [invitedMembers, setInvitedMembers] = useState([]);

    const searchUsersByEmail = async () => {
        try {
            const usersRef = collection(database, 'users');
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            let users = [];
            querySnapshot.forEach((doc) => {
                users.push({ uid: doc.id, ...doc.data() }); // Ensure we capture the UID correctly
                console.log("User found:", doc.data());
            });
            setSearchResults(users);
        } catch (error) {
            console.error("Error searching users by email:", error);
        }
    };

    const handleSelectUser = (user) => {
        console.log('handleSelectUser called with user:', user); // Check if function is called
        if (!invitedMembers.some(member => member.uid === user.uid)) {
            const updatedMembers = [...invitedMembers, user];
            setInvitedMembers(updatedMembers);
            console.log('Updated Members:', updatedMembers);
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
            const memberUids = invitedMembers.map(user => user.uid); // Use UIDs from invitedMembers
            console.log('Member UIDs being submitted:', memberUids);


            await setDoc(projectRef, {
                projectName,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                ownerId: currentUser.uid,
                members: memberUids,
            });

            console.log('Project created with ID:', projectRef.id);

            // Loop through each invited member and update their projects array
            invitedMembers.forEach(async (member) => {
                const userRef = doc(database, 'users', member.uid);
                await updateDoc(userRef, {
                    projects: arrayUnion(projectRef.id)
                });
            });

            navigation.navigate('Dashboard');
        } catch (error) {
            console.error("Error creating project: ", error);
        }
    };

    return (
        <FlatList
            data={searchResults}
            keyExtractor={item => item.uid}
            renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelectUser(item)}>
                    <Text>{item.email}</Text>
                </TouchableOpacity>
            )}
            ListHeaderComponent={
                <ProjectFormHeader
                    projectName={projectName}
                    setProjectName={setProjectName}
                    email={email}
                    setEmail={setEmail}
                    searchUsersByEmail={searchUsersByEmail}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    handleSubmit={handleSubmit}
                />
            }
        />
    );
};


export default CreateProjectForm;
