import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, database } from "../config/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import COLORS from "../constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "react-native/Libraries/NewAppScreen";


const Dashboard = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("");
  const [ownedProjects, setOwnedProjects] = useState([]);
  const [memberProjects, setMemberProjects] = useState([]);
  const PROJECT_ITEM_HEIGHT = 75; 
  const MAX_VISIBLE_ITEMS = 3; 
  const FLATLIST_HEIGHT = PROJECT_ITEM_HEIGHT * MAX_VISIBLE_ITEMS;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <MaterialCommunityIcons name="home" size={24} color={COLORS.purple} />
          <Text style={styles.headerTitleText}>Dashboard</Text>
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

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      const userDocRef = doc(database, "users", currentUser.uid);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserName(userData.username || "Anonymous User");
          } else {
            setUserName("Anonymous User");
          }
        })
        .catch((error) => {
          console.error("Error fetching user document:", error);
          setUserName("Anonymous User");
        });
    }

    const projectsRef = collection(database, "projects");
    const ownedProjectsQuery = query(
      projectsRef,
      where("ownerId", "==", currentUser.uid)
    );
    const memberProjectsQuery = query(
      projectsRef,
      where("members", "array-contains", currentUser.uid)
    );

    const unsubscribeOwned = onSnapshot(ownedProjectsQuery, (snapshot) => {
      const projects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOwnedProjects(projects);
    });

    const unsubscribeMember = onSnapshot(memberProjectsQuery, (snapshot) => {
      const projects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMemberProjects(
        projects.filter((project) => project.ownerId !== currentUser.uid)
      );
    });

    return () => {
      unsubscribeOwned();
      unsubscribeMember();
    };
  }, []);

  const handleProjectPress = (projectId) => {
    navigation.navigate("ProjectScreen", { projectId });
  };
  const deleteProject = async (projectId) => {
    const projectRef = doc(database, "projects", projectId);
    await deleteDoc(projectRef);
    setOwnedProjects((prevProjects) =>
      prevProjects.filter((project) => project.id !== projectId)
    );
  };
  const handleDeletePress = (projectId) => {
    Alert.alert(
      "Delete Project",
      "Are you sure you want to delete this project?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Deletion cancelled"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => deleteProject(projectId),
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <LinearGradient
      style={{
        flex: 1,
      }}
      colors={[COLORS.purple, COLORS.blue]}
    >
      <View style={{ flex: 1, padding: 10 }}>
        <Text style={styles.welcomeMessage}>
          Welcome back 👋{"\n"} {userName}!
        </Text>
        <View style={styles.ProjectContainer}>
        <Text style={styles.header}>Owned Projects</Text>
        <View style={{ height: FLATLIST_HEIGHT }}>
        <FlatList
          data={ownedProjects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.projectItem}>
              <TouchableOpacity onPress={() => handleProjectPress(item.id)}>
                <Text style={styles.projectName}>{item.projectName}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeletePress(item.id)}
                style={styles.deleteButton}
              >
                <MaterialCommunityIcons name="delete" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.noProjectsText}>No owned projects</Text>
          }
          
        />
        </View>

        <Text style={styles.header}>Member Projects</Text>
        <View style={{ height: FLATLIST_HEIGHT }}>
        <FlatList
          data={memberProjects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleProjectPress(item.id)}
              style={styles.projectItem}
            >
              <Text style={styles.projectName}>{item.projectName}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.noProjectsText}>No invited projects</Text>
          }
          
        />
        </View>
        </View>
      </View>
    </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  ProjectContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    marginLeft: 15,
    marginRight: 15,
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
    width: "100%", // Prevents the title from being too wide on large screens
  },
  headerTitleText: {
    marginLeft: 10,
    color: COLORS.purple, // Adjust the color to match your design
    fontSize: 18, // Adjust the size to match your design
    fontWeight: "bold",
  },
  projectItem: {
    padding: 10,
    backgroundColor: COLORS.purple,
    margin: 5,
    borderRadius: 20,
    paddingLeft: 15,
    marginLeft: 15,
    marginRight: 15,
  },
  projectName: {
    fontSize: 18,
    paddingLeft: 10,
    fontWeight: "500",
    color: 'white',
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
    marginLeft: 10,
    textAlign: "center",
    color: COLORS.purple,
  },
  deleteButton: {
    padding: 3,
    backgroundColor: COLORS.purple,
    borderRadius: 30,
    alignSelf: "flex-end",
    marginTop: -25, // Adjust based on your layout
  },
  noProjectsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "white",
  },
  welcomeMessage: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 10,
    textAlign: "center",
    color: "white",
  },
  projectstyle: {
    color: "white",
    borderRadius: 15,
    margin: 10,
  },
});

export default Dashboard;
