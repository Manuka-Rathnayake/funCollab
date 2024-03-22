import React, { useState,useLayoutEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView,KeyboardAvoidingView, SafeAreaView,Alert } from 'react-native';
import { auth, database } from "../config/firebase";
import { doc, setDoc, collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import COLORS from '../constants/colors';
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Platform } from 'react-native';

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
        backgroundColor: COLORS.purple, 
        elevation: 0, 
        shadowOpacity: 0, 
      },
      headerTitleAlign: "center",
      headerTitleContainerStyle: {
        left: 0, 
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

        if (querySnapshot.empty) {
            
            Alert.alert(
                "User Not Found",
                "No user found with that username. Please check the spelling or try another username.",
                [
                    { text: "OK" }
                ]
            );
            setSearchResults([]); 
        } else {
            const users = querySnapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            }));

            setSearchResults(users);
        }
    } catch (error) {
        console.error("Error searching users by username:", error);
    }
};


    const handleSelectUser = (user) => {
        const isUserAlreadyAdded = invitedMembers.some(member => member.uid === user.uid);

        if (isUserAlreadyAdded) {
            
            Alert.alert(
            "Member Already Added",
            "This user has already been added to the project.",
            [
                { text: "OK", onPress: () => {setSearchResults([]); setUsername('');} }
            ]
            );
        } else {
            
            const updatedMembers = [...invitedMembers, user];
            setInvitedMembers(updatedMembers);
            setUsername('');
            setSearchResults([]);
        }
    };

const handleSubmit = async () => {
    
    if (!projectName.trim()) {
        Alert.alert("Missing Information", "Please enter an event name.");
        return;
    }

    if (!eventDate || eventDate < new Date()) {
        Alert.alert("Invalid Date", "Please select a future date for the event.");
        return;
    }

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
            eventDate: eventDate,
            ownerId: currentUser.uid,
            members: memberUids,
        });
        Alert.alert("Success", "The event has been successfully created.");
        setProjectName('');
        setEventDate(new Date());
        setUsername('');
        setSearchResults([]);
        setInvitedMembers([]);

        navigation.navigate('Dashboard');
    } catch (error) {
        console.error("Error creating project: ", error);
        Alert.alert("Error", "Failed to create the event. Please try again later.");
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
    const clearForm = () => {
        setProjectName('');
        setUsername('');
        setSearchResults([]);
        setInvitedMembers([]);
    };


    return (
        <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
        style={{
            flex: 1
        }}
        colors={[COLORS.purple, COLORS.blue]}
    >
        
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
    >
        <ScrollView style={styles.container}>
            <Text style={styles.headerText}>Create a Venture</Text>
            <TextInput
                style={styles.input1}
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
            <View style= {styles.rowcontainer}>
            <TextInput
                style={styles.input2}
                placeholder="Invite friends by username"
                value={username}
                onChangeText={setUsername}
            />
            <TouchableOpacity style={styles.buttonSearch} onPress={searchUsersByUsername}>
                <Text style={styles.buttonText}>Search Users</Text>
            </TouchableOpacity>
            </View>
            {searchResults.map((item) => (
                <TouchableOpacity key={item.uid} style={styles.userItem} onPress={() => handleSelectUser(item)}>
                    <Text style={styles.userItemText}>{item.username}</Text>
                </TouchableOpacity>
            ))}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={clearForm}>
                    <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.membersContainer}>
                <Text style={styles.addedmembers}>Added Members</Text>
                    {invitedMembers.length === 0 ? (
                        <Text style={styles.noMembersText}>No members added.</Text>
                    ) : (
                        invitedMembers.map((member, index) => (
                        <View key={index} style={styles.memberItem}>
                            <Text style={styles.memberName}>{member.username}</Text>
                        </View>
                        ))
                    )}
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
        </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "white", 
    borderRadius: 30,
    marginHorizontal: 10, 
    alignSelf: "stretch", 
    width: "100%", 
  },
  membersContainer: {
    backgroundColor: '#fff', 
    padding: 10,
    borderRadius: 20, 
    marginBottom: 20,
    marginTop: 2, 
  },
  headerTitleText: {
    marginLeft: 10,
    color: COLORS.purple, 
    fontSize: 18, 
    fontWeight: "bold",
  },
  rowcontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 2,
  },
  buttonSearch: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 12, 
  },
    container: {
        flex: 1,
        padding: 20,
        //top: 20,
        paddingBottom: 20,
    },
    headerText: {
        fontSize: 26,
        marginTop: -8,
        marginBottom: 10,
        textAlign: 'center',
        color:'white',
        fontWeight: "bold",
    },
    input: {
        backgroundColor: '#fff',
        paddingTop:10,
        paddingBottom:10,
        paddingLeft:5,
        paddingRight:5,
        marginBottom: 15,
        borderRadius:20,
        fontSize: 15,
        marginRight:10
    },
    input1: {
        backgroundColor: '#fff',
        padding:10,
        marginBottom: 15,
        borderRadius:20,
        fontSize: 15,
    },
    input2: {
        backgroundColor: '#fff',
        paddingTop:10,
        paddingBottom:10,
        paddingLeft:5,
        paddingRight:5,
        marginBottom: 15,
        borderRadius:20,
        fontSize: 15,
        marginRight:10
    },
    button: {
        backgroundColor:COLORS.white,
        padding: 12,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 10,
        flex: 1, 
        margin: 2,
    },
    userItem: {
        backgroundColor: '#f9f9f9',
        padding:10,
        marginTop: -15,
        marginBottom: 15,
        borderRadius: 20,
    },
    userItemText: {
        fontSize: 16,
        
    },
    datePickerButton: {
        padding: 10,
        backgroundColor: 'white', 
        borderRadius:20,
        marginBottom:10
    },
    buttonText: {
        color: COLORS.purple,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: "bold",
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
        borderRadius: 15,
    },
    memberName: {
        fontSize: 16,
        color: '#333', 
        textAlign: 'center',
        fontWeight: "bold",
    },
    addedmembers: {
        fontSize: 18,
        marginTop: 2,
        marginBottom: 2,
        textAlign: 'center',
        color: COLORS.purple,
        fontWeight: "bold",
    },
    noMembersText: {
    textAlign: 'center', 
    color: 'gray', 
    padding: 20, 
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    alignItems: 'center',
    marginTop: -15, 
  },
});

export default CreateProjectForm;
