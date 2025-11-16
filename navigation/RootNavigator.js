// navigation/RootNavigator.js
import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import GameScreen from '../screens/Game/GameScreen';
import LeaderboardScreen from '../screens/Leaderboard/LeaderboardScreen';
import UserScreen from '../screens/User/UserScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, logout } = useContext(AuthContext);
  const navigation = useNavigation?.() ?? null;

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false, // Hide header for Home too since you have logout in the UI
            }}
          />
          <Stack.Screen 
            name="Game" 
            component={GameScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Leaderboard" 
            component={LeaderboardScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="User" 
            component={UserScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false, // This removes the header completely
            }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{
              headerShown: false, // This removes the header completely
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}