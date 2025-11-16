// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { initDB } from './utils/db';

export default function App() {
  useEffect(() => {
    initDB().catch(err => console.log('DB init error', err));
  }, []);

  return (
    <AuthProvider>
      <GameProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </GameProvider>
    </AuthProvider>
  );
}
