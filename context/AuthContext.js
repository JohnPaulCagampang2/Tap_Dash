// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

const USERS_KEY = 'tapdash_users';
const SESSION_KEY = 'tapdash_user_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current session on startup
  useEffect(() => {
    (async () => {
      try {
        const rawSession = await AsyncStorage.getItem(SESSION_KEY);
        if (rawSession) setUser(JSON.parse(rawSession));
      } catch (e) {
        console.log('Auth load session error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Get all registered users
  const getRegisteredUsers = async () => {
    try {
      const raw = await AsyncStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.log('getRegisteredUsers error', e);
      return [];
    }
  };

// Register user (email, username, password)
const register = async (email, username, password) => {
  console.log('Register called with:', { email, username, password: password ? '***' : undefined });
  
  if (!email || !username || !password) {
    return { success: false, message: 'Email, username, and password are required' };
  }

  const users = await getRegisteredUsers();
  const emailLower = email.toLowerCase();
  
  // ✅ Filter out any corrupted user objects and add defensive check
  const validUsers = users.filter(u => u && u.email);
  const exists = validUsers.find(u => u.email.toLowerCase() === emailLower);
  
  if (exists) return { success: false, message: 'Email already registered' };

  const newUser = { email: emailLower, username, password };
  validUsers.push(newUser);

  try {
    // Save the cleaned user list
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(validUsers));
    return { success: true, message: 'Registered successfully' };
  } catch (e) {
    console.log('register error', e);
    return { success: false, message: 'Failed to register' };
  }
};

// Login - also add defensive checks
const login = async (email, password) => {
  console.log('Login called with:', { email, password: password ? '***' : undefined });
  
  if (!email || !password) return { success: false, message: 'Email and password required' };

  const users = await getRegisteredUsers();
  const emailLower = email.toLowerCase();
  
  // ✅ Add defensive check here too
  const validUsers = users.filter(u => u && u.email);
  const found = validUsers.find(u => u.email.toLowerCase() === emailLower);
  
  if (!found) return { success: false, message: 'Email not found. Please register first.' };

  if (found.password !== password) return { success: false, message: 'Invalid password' };

  const sess = { email: found.email, username: found.username };
  setUser(sess);

  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sess));
  } catch (e) {
    console.log('session save error', e);
  }

  return { success: true, message: 'Logged in', user: sess };
};

  // Logout
  const logout = async () => {
    setUser(null);
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.log('logout error', e);
    }
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, register, login, logout, getRegisteredUsers }}>
      {children}
    </AuthContext.Provider>
  );
};