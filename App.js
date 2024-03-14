import React, { useState, useEffect, createContext } from 'react';
import { ActivityIndicator, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { onAuthStateChanged } from 'firebase/auth';
import * as Animatable from 'react-native-animatable';
import { auth } from './config/firebase'; // Adjust this path as necessary
// Screens
import Login from './screens/Login';
import Signup from './screens/Signup';
import Welcome from './screens/Welcome';
import Dashboard from './screens/dashboard';
import CreateProjectForm from './screens/CreateProject';
import ProjectScreen from './screens/ProjectScreen';
import ProfileSettingsScreen from './screens/ProfileSettingsScreen';
import COLORS from './constants/colors';

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
            color= focused? COLORS.purple:'grey'
          } else if (route.name === 'ProfileSettingsScreen') {
            iconName = focused ? 'account' : 'account-outline';
            color= focused? COLORS.purple:'grey'
          } else if (route.name === 'CreateProjectForm') {
            color= focused? COLORS.purple:'grey'
            iconName = focused ? "plus-circle": "plus-circle-outline";
          }
          
          return <MaterialCommunityIcons name={iconName} size={35} color={color} />;
        },
        tabBarStyle:{
            borderRadius:20,
            position:'absolute',
            bottom: 30,
            marginLeft:25,
            marginRight:25,
            height:55,
        },
        tabBarLabelStyle:{
            display:'none'
        },
        tabBarIconStyle:{
          
        }
      })}

    >
      <Tab.Screen name='Dashboard' component={Dashboard}  />
      <Tab.Screen name='CreateProjectForm' component={CreateProjectForm} />
      <Tab.Screen name='ProfileSettingsScreen' component={ProfileSettingsScreen} />
      
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
