import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  Image,
  ImageBackground,
  SafeAreaView
} from "react-native";
import { auth, database } from "../config/firebase";
import {
  doc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import COLORS from "../constants/colors";
import { useNavigation } from '@react-navigation/native';

const buildingBW = require("../assets/building-bw.png");
const buildingColor = require("../assets/building-color.png");
const cityLandscape = require("../assets/landscape.jpg"); // Your local path to the image

const ProjectScreen = ({ route }) => {
  const { projectId } = route.params;
  const [project, setProject] = useState(null);
  const [taskName, setTaskName] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const currentUser = auth.currentUser;
  const inputRef = useRef(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskName, setNewTaskName] = useState("");
  const [daysRemaining, setDaysRemaining] = useState(null);

  const PROJECT_ITEM_HEIGHT = 80; 
  const MAX_VISIBLE_ITEMS = 3; 
  const FLATLIST_HEIGHT = PROJECT_ITEM_HEIGHT * MAX_VISIBLE_ITEMS;

  const navigation = useNavigation();

    useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <MaterialCommunityIcons name="home" size={24} color={COLORS.purple} />
          <Text style={styles.headerTitleText}>Event</Text>
        </View>
      ),
      headerStyle: {
        backgroundColor: COLORS.purple, // Adjust the color to your header's background
      },
      headerTitleAlign: "center",
      headerBackVisible: false,
      headerTitleContainerStyle: {
        left: 0, // Adjust these values to bring the title closer to the center if needed
        right: 0,
      },
      
    });
  }, [navigation]);


  useEffect(() => {
    if (project && project.eventDate) {
      const eventDate = project.eventDate.toDate();
      const timeRemaining = eventDate - new Date();
      const days = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
      setDaysRemaining(days);
    }
  }, [project]);

  useEffect(() => {
    console.log("Fetching project...");
    const projectRef = doc(database, "projects", projectId);

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
    const usersRef = collection(database, "users");
    const memberQuery = query(usersRef, where("uid", "in", project.members));

    const unsubscribeMembers = onSnapshot(memberQuery, (querySnapshot) => {
      const membersData = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));
      setMembers(membersData);
    });

    return () => unsubscribeMembers();
  }, [project]); // Depends on project to re-run when it changes

  const handleAddTask = async () => {
    if (!taskName.trim() || !selectedMember) {
      Alert.alert("Error", "Please enter a task name and select a member.");
      return;
    }

    const projectRef = doc(database, "projects", projectId);
    const newTask = {
      id: Date.now().toString(),
      taskName,
      assignedTo: selectedMember,
      isCompleted: false,
    };

    await updateDoc(projectRef, {
      tasks: arrayUnion(newTask),
    });

    setTaskName("");
    setSelectedMember("");
    Keyboard.dismiss(); // Dismiss the keyboard after task is added
  };
  const handleCompleteTask = async (taskId) => {
    // Find the task that matches the taskId
    const task = tasks.find((task) => task.id === taskId);

    // Check if the current user is the assigned member for the task
    if (auth.currentUser.uid === task.assignedTo) {
      const projectRef = doc(database, "projects", projectId);
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      );

      await updateDoc(projectRef, {
        tasks: updatedTasks,
      });
    } else {
      Alert.alert("Error", "You can only complete tasks assigned to you.");
    }
  };

    const renderTaskItem = ({ item }) => {
      const assignedMember = members.find(
        (member) => member.uid === item.assignedTo
      );
      const displayName = assignedMember
        ? assignedMember.username
        : "Unassigned";

      const handleEditPress = (task) => {
        setEditingTask(task);
        setNewTaskName(task.taskName);
        setEditModalVisible(true);
      };

      const handleDeletePress = () => {
        Alert.alert(
          "Delete Task",
          "Are you sure you want to delete this task?",
          [
            { text: "Cancel" },
            { text: "Delete", onPress: () => handleDeleteTask(item.id) },
          ]
        );
      };
      const handleDeleteTask = async (taskId) => {
        const updatedTasks = tasks.filter((task) => task.id !== taskId);

        const projectRef = doc(database, "projects", projectId);
        await updateDoc(projectRef, {
          tasks: updatedTasks,
        });
      };

      return (
        <View style={styles.taskItem}>
          <Text
            style={[
              styles.taskText,
              item.isCompleted && styles.taskCompleted, // Add strikethrough if task is completed
            ]}
          >
            {displayName} - {item.taskName}
          </Text>
          <TouchableOpacity onPress={() => handleCompleteTask(item.id)}>
            <MaterialCommunityIcons
              name={
                item.isCompleted
                  ? "check-circle-outline"
                  : "checkbox-blank-circle-outline"
              }
              size={24}
              color={item.isCompleted ? "white" : "white"}
            />
          </TouchableOpacity>
          {currentUser?.uid === project?.ownerId && (
            <>
              <TouchableOpacity onPress={() => handleEditPress(item)}>
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={24}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDeletePress}>
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      );
    };

    const handleEditTask = async (taskId, newTaskName) => {
      const updatedTasks = tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, taskName: newTaskName };
        }
        return task;
      });

      const projectRef = doc(database, "projects", projectId);
      await updateDoc(projectRef, {
        tasks: updatedTasks,
      });
    };

    const isAllTasksCompletedByMember = (memberUid) => {
    const tasksAssignedToMember = tasks.filter(task => task.assignedTo === memberUid);
    return tasksAssignedToMember.every(task => task.isCompleted);
    };
const renderBuildings = () => (
      <ImageBackground
        source={cityLandscape}
        style={styles.cityBackground}
        imageStyle={{ borderRadius: 10 }}
      >
        {members.map((member, index) => (
          <Image
            key={index}
            source={
              isAllTasksCompletedByMember(member.uid)
                ? buildingColor
                : buildingBW
            }
            style={styles.buildingImage}
          />
        ))}
      </ImageBackground>
    );


  return (
    <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          style={{
            flex: 1,
          }}
          colors={[COLORS.purple, COLORS.blue]}
        >
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.header}>{project?.projectName}</Text>
          <Text style={styles.date}>
                  Days Remaining:{" "}
                  {daysRemaining > 0 ? daysRemaining : "The event has passed."}
                </Text>
          <View style={styles.buildingsContainer}>
            {renderBuildings()}
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
                <TouchableOpacity style={styles.button} onPress={() => setPickerVisible(true)}>
                  <Text style={styles.buttonText}>Select Member</Text>
                </TouchableOpacity>
                <View style={styles.buttonSpacer}></View>
                  <TouchableOpacity style={styles.button} onPress={handleAddTask}>
                    <Text style={styles.buttonText}>Add Task</Text>
                  </TouchableOpacity>
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
                    onValueChange={(itemValue, itemIndex) =>
                      setSelectedMember(itemValue)
                    }
                    style={styles.picker}
                  >
                    {members.map((member) => (
                      <Picker.Item
                        key={member.uid}
                        label={member.username}
                        value={member.uid}
                      />
                    ))}
                  </Picker>
                  <Button
                    title="Done"
                    onPress={() => setPickerVisible(false)}
                  />
                </View>
              </Modal>
              <Modal
                      visible={isEditModalVisible}
                      animationType="slide"
                      transparent={true}
                      onRequestClose={() => setEditModalVisible(false)}
                    >
                      <View style={styles.modalView}>
                        <TextInput
                          style={styles.input}
                          placeholder="Edit task name"
                          value={newTaskName}
                          onChangeText={setNewTaskName}
                        />
                        <Button
                          title="Save"
                          onPress={() => {
                            if (editingTask) {
                              handleEditTask(editingTask.id, newTaskName);
                              setEditModalVisible(false);
                            }
                          }}
                        />
                      </View>
                    </Modal>
            </View>
          )}
          {/* Task List */}
          <View style={styles.ProjectContainer}>
            <View style={{ height: FLATLIST_HEIGHT }}>
              <FlatList
                data={tasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTaskItem}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
    </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    //backgroundColor: "#fff", // or any color that suits your app theme
  },
  ProjectContainer: {
    backgroundColor: "white",
    borderRadius: 10,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "white", // Adjust if you want a different background for the title
    borderRadius: 30,
    marginHorizontal: 10, // Keeps the header title container within the screen bounds
    alignSelf: "stretch", // Make sure this is set to 'stretch' or just remove it
    width: "90%", // Prevents the title from being too wide on large screens
  },
  headerTitleText: {
    marginLeft: 10,
    color: COLORS.purple, // Adjust the color to match your design
    fontSize: 18, // Adjust the size to match your design
    fontWeight: "bold",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // This spreads out the buttons
    alignItems: "center",
    marginTop: 10, // Adds some space above the button container
  },
  buttonSpacer: {
    width: 5, // Adjust the width for desired spacing between buttons
    borderRadius: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#fff", // White text color
  },
  formContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "white", // light gray background for the form container
    borderRadius: 10,
  },
  input: {
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  buildingsContainer: {
    height: 200, // Set the height according to your landscape image
    width: '100%', // The container should span the width of the screen
    backgroundColor: 'transparent',
  },
  cityBackground: {
    flex: 1, // The background should fill the container
    flexDirection: 'row', // Lay out children in a row
    justifyContent: 'space-evenly', // Space out the buildings evenly
    alignItems: 'center', // Align buildings vertically
    marginBottom:10,
    borderRadius: 10,
  },
  buildingImage: {
    width: 50, // Width of the building image
    height: 100, // Height of the building image
    resizeMode: 'contain', // Ensure the entire building is visible
    marginHorizontal: -80,

  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: COLORS.purple,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  taskText: {
    fontSize: 16,
    flex: 1,
    color: 'white' // ensures the text takes up as much space as possible
  },
  checkIconImage: {
    width: 24, // Define your size
    height: 24,
  },
  button: {
    backgroundColor: COLORS.purple, // a nice blue color for the button
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    borderRadius:10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
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
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButton: {
    marginTop: 20,
  },
  backgroundImage: {
    position: "absolute", // Allows content to be displayed over the background
    width: "100%", // Sets the width to the full width of the container
    height: "100%", // Sets the height to the full height of the container
    resizeMode: "cover", // Covers the entire background without stretching the image
  },
    taskCompleted: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    color: 'white',
  },
  date: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#fff",
  },
  
});

export default ProjectScreen;



