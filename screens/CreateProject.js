import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { auth, database } from "../config/firebase";
import { doc, setDoc, collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateProjectForm = ({ navigation }) => {
    const [projectName, setProjectName] = useState('');
    const [username, setUsername] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [invitedMembers, setInvitedMembers] = useState([]);
    const [eventDate, setEventDate] = useState(new Date()); 
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [submittedMembers, setSubmittedMembers] = useState([]);

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
            setUsername('');
            setSearchResults([]);
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
                eventDate: new Date(eventDate),
                ownerId: currentUser.uid,
                members: memberUids,
            });
            setProjectName('');
            setEventDate(new Date());
            setUsername('');
            setSearchResults([]);
            setInvitedMembers([]);

            navigation.navigate('Dashboard');
        } catch (error) {
            console.error("Error creating project: ", error);
        }
    };
    const showDatepicker = () => {
        setShowDatePicker((current) => !current);
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        const currentDate = selectedDate || eventDate;
        setEventDate(currentDate);
    };


    return (
        <ScrollView style={styles.container}>
            <Text style={styles.headerText}>Create your Event</Text>
            <TextInput
                style={styles.input}
                placeholder="Event name"
                value={projectName}
                onChangeText={setProjectName}
            />
            <TouchableOpacity onPress={showDatepicker} style={styles.datePickerButton}>
                <Text>Select Event Date</Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={eventDate}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onDateChange}
                    style={styles.datePicker}
                />
            )}
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
            <Text style={styles.addedmembers}>Added Members:</Text>
            {invitedMembers.map((member, index) => (
                <View key={index} style={styles.memberItem}>
                    <Text style={styles.memberName}>{member.username}</Text>
                </View>
            ))}
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
        textAlign: 'center',
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
    datePickerButton: {
        padding: 10,
        backgroundColor: 'white', 
        borderRadius: 5,
        marginVertical: 10,
    },
    buttonText: {
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 16,
    },
    dateDisplay: {
        fontSize: 16,
        padding: 10,
        backgroundColor: '#f0f0f0', 
        borderRadius: 5,
        marginTop: 5,
        color: '#333',
        textAlign: 'center',
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginTop: 5,
        backgroundColor: '#f0f0f0', 
        borderRadius: 5,
    },
    memberName: {
        fontSize: 16,
        color: '#333', 
        textAlign: 'center',
    },
    addedmembers: {
        fontSize: 16,
        marginTop: 10,
        textAlign: 'center',
    },
});

export default CreateProjectForm;
