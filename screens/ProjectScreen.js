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
const cityLandscape = require("../assets/landscape.jpg"); 

const ProjectScreen = ({ route }) => {
  const { projectId } = route.params;
  const [project, setProject] = useState(null);
  const [taskName, setTaskName] = useState("");
  const [selectedMember, setSelectedMember] = useState("none");
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
        backgroundColor: COLORS.purple, 
      },
      headerTitleAlign: "center",
      headerBackVisible: false,
      headerTitleContainerStyle: {
        left: 0, 
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
  }, [projectId]); 

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
  }, [project]); 

  const handleAddTask = async () => {
    if (!taskName.trim() || selectedMember === "none") {
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
    Keyboard.dismiss(); 
  };
  const handleCompleteTask = async (taskId) => {
    
    const task = tasks.find((task) => task.id === taskId);

    
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
              item.isCompleted && styles.taskCompleted, 
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
                <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Picker
                    selectedValue={selectedMember}
                    onValueChange={(itemValue, itemIndex) =>
                      setSelectedMember(itemValue)
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Select a member" value="none" />
                    {members.map((member) => (
                      <Picker.Item
                        key={member.uid}
                        label={member.username}
                        value={member.uid}
                      />
                    ))}
                  </Picker>
                  <TouchableOpacity
                    onPress={() => setPickerVisible(false)}
                    style={[styles.button, styles.saveButton]}
                  >
                    <Text style={styles.buttonText}>Done</Text>
                  </TouchableOpacity>
                </View>
                </View>
              </Modal>
              <Modal
                      visible={isEditModalVisible}
                      animationType="slide"
                      transparent={true}
                      onRequestClose={() => setEditModalVisible(false)}
                    >
                    <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalView}>
                        <TextInput
                          style={styles.input}
                          placeholder="Edit task name"
                          value={newTaskName}
                          onChangeText={setNewTaskName}
                        />
                        <View style={styles.buttonContainer}>
                          <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={() => {
                              if (editingTask) {
                                handleEditTask(editingTask.id, newTaskName);
                                setEditModalVisible(false);
                              }
                            }}
                          >
                            <Text style={styles.buttonText}>Save</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={() => {
                              setEditModalVisible(false);
                            }}
                          >
                            <Text style={styles.buttonText}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    </TouchableWithoutFeedback>
                    </Modal>
            </View>
          )}
          <View style={styles.ProjectContainer}>
              {tasks.length === 0 ? (
                <Text style={styles.noTasksText}>No added tasks.</Text>
              ) : (
                <View style={{ height: FLATLIST_HEIGHT }}>
                  <FlatList
                    data={tasks}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderTaskItem}
                  />
                </View>
              )}
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
    paddingTop:0
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
    backgroundColor: "white", 
    borderRadius: 30,
    marginHorizontal: 10, 
    alignSelf: "stretch", 
    width: "90%", 
  },
  headerTitleText: {
    marginLeft: 10,
    color: COLORS.purple, 
    fontSize: 18, 
    fontWeight: "bold",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between", 
    alignItems: "center",
    marginTop: 10, 
  },
  buttonSpacer: {
    width: 5, 
    borderRadius: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#fff", 
  },
  formContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "white", 
    borderRadius: 10,
  },
  input: {
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    width: "100%",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    width: "100%",
  },
  buildingsContainer: {
    height: 200, 
    width: '100%', 
    backgroundColor: 'transparent',
  },
  cityBackground: {
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'space-evenly', 
    alignItems: 'center', 
    marginBottom:10,
    borderRadius: 10,
  },
  buildingImage: {
    width: 50, 
    height: 100, 
    resizeMode: 'contain', 
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
    color: 'white' 
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
    width: "80%",
  },
  modalButton: {
    marginTop: 20,
  },
  backgroundImage: {
    position: "absolute", 
    width: "100%", 
    height: "100%", 
    resizeMode: "cover", 
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
  },
  modalContent:{
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
    shadowRadius: 3.84,
    elevation: 5,
    width: '80%', 
  },
  noTasksText: {
    textAlign: 'center',
    color: 'grey',
    fontSize: 16,
    padding: 20, 
  },
  saveButton: {
    backgroundColor: COLORS.purple, 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center', 
    justifyContent: 'center', // Center text vertically
    elevation: 2, 
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    marginHorizontal: 10, // Add some margin to the buttons
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  saveButtonText: {
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold', // Make the text bold
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    marginTop: 20, // Adjust as needed
  },
  cancelButton: {
    backgroundColor: '#999', 
  },
});

export default ProjectScreen;



