import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import prompt_ai from './src/Screens/prompt_ai'
import Home from './src/Screens/Home';
import Explorepage from './src/Screens/Explorepage';
import Camera from './src/Screens/Camera';
import Verify from './src/Screens/Verify';
import  SignIn from './src/Screens/SignIn';
import SignUp from './src/Screens/SignUp';
import ProfileSetup from './src/Screens/ProfileSetup';
import Loading from './src/Components/Loading';
import CameraStyling from './src/Screens/CameraStyling';
import AllComments from './src/Components/AllComments';
import GalleryPage from './src/Components/GalleryPage';
import CustomTabBar from './src/Components/CustomTabBar';
import PollModal from './src/Components/PollModal';
import PollItem from './src/Components/PollItem';
import { PollContext, PollProvider } from './src/Components/PollContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function Main() {
  return (

    <Tab.Navigator
    screenOptions={({ route}) => ({
      headerShown: false,  // Disable header for all tab screens
      tabBarStyle: route.name === 'Camera' ? { display: 'none' } : {}, // Hide tab bar on Camera screen
    })}
     tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={Explorepage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="compass" color={color} size={size} />
          ),
          
        }}
      />
      <Tab.Screen
        name="Camera"
        component={Camera}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera-outline" color={color} size={size} />
          ),
          tabBarVisible: false, // Hide tab bar when on the Camera screen
        }}
      />
    </Tab.Navigator>
  );
}
function AuthStack() { // Stack for auth screens
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="Verify" component={Verify} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetup} /> 
    </Stack.Navigator>
  );
}

export default function App() {
  const [initialScreen, setInitialScreen] = useState('AuthStack');

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        setInitialScreen(userData ? 'Main' : 'AuthStack');

      } catch (error) {
        console.error('Error checking user session:', error);
        setInitialScreen('AuthStack'); // Default to Auth on error
      }
    };
    checkUserSession();
  }, []); 



  return (
    <PollProvider>
    <NavigationContainer>
    {initialScreen === 'Loading' ? (
      <Loading /> 
    ) : (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="AuthStack" component={AuthStack} />
          <Stack.Screen name="Main" component={Main} options={{ headerShown: false }} />
          <Stack.Screen name="CameraStyling" component={CameraStyling}options={{ headerShown: false }} />
          <Stack.Screen name="prompt_ai" component={prompt_ai} options={{headerShown: false}} />
          <Stack.Screen name="AllComments" component={AllComments} options={{headerShown: false}}/>
          <Stack.Screen name="GalleryPage" component={GalleryPage} options={{headerShown: false}}/>
          <Stack.Screen name="PollModal" component={PollModal} options={{headerShown: false}}/>
          <Stack.Screen name="PollItem" component={PollItem} options={{headerShown: false}}/>
          
      </Stack.Navigator>
    )}
  </NavigationContainer>
  </PollProvider>
  );
}