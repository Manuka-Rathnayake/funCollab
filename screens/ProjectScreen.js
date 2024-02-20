import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert,
    KeyboardAvoidingView, Platform, Modal, Keyboard, TouchableWithoutFeedback, StyleSheet,Image
} from 'react-native';
import { auth, database } from "../config/firebase";
import {
    doc, getDocs, collection, query, where, onSnapshot, updateDoc, arrayUnion
} from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const buildingBW = require('../assets/building-bw.png');
const buildingColor = require('../assets/building-color.png');
const checkIcon = require('../assets/check.png');
const uncheckIcon = require('../assets/check.png');

const ProjectScreen = ({ route }) => {
    const { projectId } = route.params;
    const [project, setProject] = useState(null);
    const [taskName, setTaskName] = useState('');
    const [selectedMember, setSelectedMember] = useState('');
    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [isPickerVisible, setPickerVisible] = useState(false);
    const currentUser = auth.currentUser;
    const inputRef = useRef(null);

    useEffect(() => {
        console.log("Fetching project...");
        const projectRef = doc(database, 'projects', projectId);

        const unsubscribeProject = onSnapshot(projectRef, (documentSnapshot) => {
            if (documentSnapshot.exists()) {
                const projectData = documentSnapshot.data();
                setProject(projectData);
                setTasks(projectData.tasks || []);
            } else {
                console.log("No such project!");
            }
        });

        return () => unsubscribeProject();
    }, [projectId]); // Depends on projectId to re-run when it changes

    useEffect(() => {
        if (!project || !project.members) return;

        console.log("Fetching members based on project data...");
        const usersRef = collection(database, 'users');
        const memberQuery = query(usersRef, where('uid', 'in', project.members));

        const unsubscribeMembers = onSnapshot(memberQuery, (querySnapshot) => {
            const membersData = querySnapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            }));
            setMembers(membersData);
        });

        return () => unsubscribeMembers();
    }, [project]); // Depends on project to re-run when it changes


    const handleAddTask = async () => {
        if (!taskName.trim() || !selectedMember) {
            Alert.alert('Error', 'Please enter a task name and select a member.');
            return;
        }

        const projectRef = doc(database, 'projects', projectId);
        const newTask = {
            id: Date.now().toString(),
            taskName,
            assignedTo: selectedMember,
            isCompleted: false
        };

        await updateDoc(projectRef, {
            tasks: arrayUnion(newTask)
        });

        setTaskName('');
        setSelectedMember('');
        Keyboard.dismiss(); // Dismiss the keyboard after task is added
    };
    const handleCompleteTask = async (taskId) => {
        // Find the task that matches the taskId
        const task = tasks.find(task => task.id === taskId);

        // Check if the current user is the assigned member for the task
        if (auth.currentUser.uid === task.assignedTo) {
            const projectRef = doc(database, 'projects', projectId);
            const updatedTasks = tasks.map(task =>
                task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
            );

            await updateDoc(projectRef, {
                tasks: updatedTasks
            });
        } else {
            Alert.alert('Error', 'You can only complete tasks assigned to you.');
        }
    };

    const renderTaskItem = ({ item }) => {
        const assignedMember = members.find(member => member.uid === item.assignedTo);
        const displayName = assignedMember ? assignedMember.username : 'Unassigned';

        return (
            <View style={styles.taskItem}>
                <Text style={styles.taskText}>{item.taskName} - {displayName}</Text>
                <TouchableOpacity onPress={() => handleCompleteTask(item.id)}>
                    <Image source={item.isCompleted ? checkIcon : uncheckIcon} style={styles.checkIconImage} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    {/* Project Title */}
                    <Text style={styles.header}>Project: {project?.projectName}</Text>

                    {/* Buildings Displayed Here */}
                    <View style={styles.buildingsContainer}>
                        {members.map((member, index) => (
                            <Image
                                key={index}
                                source={tasks.some(task => task.assignedTo === member.uid && task.isCompleted) ? buildingColor : buildingBW}
                                style={styles.buildingImage}
                            />
                        ))}
                    </View>
                    {currentUser?.uid === project?.ownerId && (
                        <View style={styles.formContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Type task here"
                                value={taskName}
                                onChangeText={setTaskName}
                            />
                            <View style={styles.buttonsContainer}>
                                <Button title="Select Member" onPress={() => setPickerVisible(true)} />
                                <View style={styles.buttonSpacer}></View>
                                <Button title="Add Task" onPress={handleAddTask} />
                            </View>
                            <Modal
                                visible={isPickerVisible}
                                animationType="slide"
                                transparent={true}
                                onRequestClose={() => setPickerVisible(false)}
                            >
                                <View style={styles.modalView}>
                                    <Picker
                                        selectedValue={selectedMember}
                                        onValueChange={(itemValue, itemIndex) => setSelectedMember(itemValue)}
                                        style={styles.picker}
                                    >
                                        {members.map((member) => (
                                            <Picker.Item key={member.uid} label={member.username} value={member.uid} />
                                        ))}
                                    </Picker>
                                    <Button title="Done" onPress={() => setPickerVisible(false)} />
                                </View>
                            </Modal>
                        </View>
                    )}
                    {/* Task List */}
                    <FlatList
                        data={tasks}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderTaskItem}
                    />
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff', // or any color that suits your app theme
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // This spreads out the buttons
        alignItems: 'center',
        marginTop: 10, // Adds some space above the button container
    },
    buttonSpacer: {
        width: 10, // Adjust the width for desired spacing between buttons
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    formContainer: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f2f2f2', // light gray background for the form container
        borderRadius: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    picker: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    buildingsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        flexWrap: 'wrap', // allows buildings to wrap to the next line
    },
    buildingImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain', // ensures the images are scaled correctly
        margin: 5, // adds spacing around each building image
    },
    taskItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    taskText: {
        fontSize: 16,
        flex: 1, // ensures the text takes up as much space as possible
    },
    checkIconImage: {
        width: 24, // Define your size
        height: 24,
    },
    button: {
        backgroundColor: '#007bff', // a nice blue color for the button
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalButton: {
        marginTop: 20,
    },
});


export default ProjectScreen;