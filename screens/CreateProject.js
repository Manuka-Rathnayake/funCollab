import React, { useState,useLayoutEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { auth, database } from "../config/firebase";
import { doc, setDoc, collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import COLORS from '../constants/colors';
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const CreateProjectForm = ({ navigation }) => {
    const [projectName, setProjectName] = useState('');
    const [username, setUsername] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [invitedMembers, setInvitedMembers] = useState([]);
    const [eventDate, setEventDate] = useState(new Date()); 
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [submittedMembers, setSubmittedMembers] = useState([]);

    useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <MaterialCommunityIcons name="plus-circle" size={24} color={COLORS.purple} />
          <Text style={styles.headerTitleText}>Create a Event</Text>
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
            const memberUids = [...new Set([...invitedMembers.map(user => user.uid), currentUser.uid])];

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
        <LinearGradient
        style={{
            flex: 1
        }}
        colors={[COLORS.purple, COLORS.blue]}
    >
        <ScrollView style={styles.container}>
            <Text style={styles.headerText}>Create your Event</Text>
            <TextInput
                style={styles.input}
                placeholder="Event name"
                value={projectName}
                onChangeText={setProjectName}
            />
            <TouchableOpacity onPress={showDatepicker} style={styles.datePickerButton}>
                <Text style={{color:COLORS.purple}}>Select Event Date</Text>
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
        </LinearGradient>
    );
};

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
    container: {
        flex: 1,
        padding: 20,
        top: 20
    },
    headerText: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        color:'white'
    },
    input: {
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 10,
        borderRadius:30
    },
    button: {
        backgroundColor:COLORS.white,
        padding: 10,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 10
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
        borderRadius:30,
        marginBottom:10
    },
    buttonText: {
        color: COLORS.purple,
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
        color:'white'
    },
});

export default CreateProjectForm;
