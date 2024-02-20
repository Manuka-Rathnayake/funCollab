import React, { useState, useEffect, createContext } from 'react';
import { ActivityIndicator, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase'; // Adjust this path as necessary
// Screens
import Login from './screens/Login';
import Signup from './screens/Signup';
import Welcome from './screens/Welcome';
import Home from './screens/Home';
import Profile from './screens/Profile';
import Dashboard from './screens/dashboard';
import CreateProjectForm from './screens/CreateProject';
import ProjectScreen from './screens/ProjectScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AuthenticatedUserContext = createContext();

function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName='Dashboard'
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          } else if (route.name === 'CreateProjectForm') {
            iconName = focused? 'plus-circle': 'plus-circle-outline';
          }
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name='Dashboard' component={Dashboard} />
      <Tab.Screen name='Profile' component={Profile} />
      <Tab.Screen name='Create Project' component={CreateProjectForm} />
      
    </Tab.Navigator>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user ? user : null);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser }}>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen name="HomeTabs" component={BottomTabs} options={{ headerShown: false }} />
              <Stack.Screen name="ProjectScreen" component={ProjectScreen} options={{ headerShown: true }}/>
            </>
          ) : (
            <>
              <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
              <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
              <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthenticatedUserContext.Provider>
  );
}

export default App;
