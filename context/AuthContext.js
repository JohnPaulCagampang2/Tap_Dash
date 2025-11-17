// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

const USERS_KEY = 'tapdash_users';
const SESSION_KEY = 'tapdash_user_session';

// 🔒 HARDCODED ADMIN CREDENTIALS - CHANGE THESE!
const ADMIN_EMAIL = 'admindev@gmail.com';
const ADMIN_USERNAME = 'Admin';
const ADMIN_PASSWORD = 'admin123'; // ⚠️ CHANGE THIS TO YOUR PASSWORD!

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

  // 🔐 AUTO-CREATE ADMIN ACCOUNT ON STARTUP
  useEffect(() => {
    (async () => {
      try {
        const users = await getRegisteredUsers();
        const validUsers = users.filter(u => u && u.email);
        const adminExists = validUsers.some(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
        
        if (!adminExists) {
          // Create admin account automatically
          const adminUser = { 
            email: ADMIN_EMAIL.toLowerCase(), 
            username: ADMIN_USERNAME, 
            password: ADMIN_PASSWORD, 
            isAdmin: true,
            displayName: ADMIN_USERNAME
          };
          validUsers.push(adminUser);
          await AsyncStorage.setItem(USERS_KEY, JSON.stringify(validUsers));
          console.log('✅ Admin account created automatically!');
          console.log('📧 Email:', ADMIN_EMAIL);
          console.log('🔑 Password:', ADMIN_PASSWORD);
        } else {
          // Admin exists, but make sure isAdmin flag is set
          const adminIndex = validUsers.findIndex(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
          if (adminIndex !== -1 && !validUsers[adminIndex].isAdmin) {
            validUsers[adminIndex].isAdmin = true;
            await AsyncStorage.setItem(USERS_KEY, JSON.stringify(validUsers));
            console.log('✅ Admin flag updated for existing account!');
          }
        }
      } catch (e) {
        console.log('Auto-create admin error', e);
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

    // 🔒 SET YOUR ADMIN EMAIL HERE - CHANGE THIS!
    const isAdmin = emailLower === ADMIN_EMAIL.toLowerCase();
    
    const newUser = { email: emailLower, username, password, isAdmin };
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

    // Include all user data in session (displayName, photoURL, isAdmin, etc.)
    const sess = { 
      email: found.email, 
      username: found.username,
      displayName: found.displayName || found.username,
      photoURL: found.photoURL || null,
      isAdmin: found.isAdmin || false  // ✅ Include isAdmin flag
    };
    setUser(sess);

    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sess));
    } catch (e) {
      console.log('session save error', e);
    }

    return { success: true, message: 'Logged in', user: sess };
  };

  // Update user profile (displayName, photoURL, etc.)
  const updateProfile = async (updates) => {
    if (!user) return { success: false, message: 'No user logged in' };

    try {
      const users = await getRegisteredUsers();
      const validUsers = users.filter(u => u && u.email);
      const userIndex = validUsers.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());

      if (userIndex === -1) {
        return { success: false, message: 'User not found' };
      }

      // Update the user object with new data
      validUsers[userIndex] = {
        ...validUsers[userIndex],
        ...updates
      };

      // Save updated users list
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(validUsers));

      // Update current session
      const updatedUser = {
        ...user,
        ...updates
      };
      setUser(updatedUser);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));

      return { success: true, message: 'Profile updated' };
    } catch (e) {
      console.log('updateProfile error', e);
      return { success: false, message: 'Failed to update profile' };
    }
  };

  // Admin: Update any user by email
  const updateUser = async (email, updates) => {
    try {
      const users = await getRegisteredUsers();
      const validUsers = users.filter(u => u && u.email);
      const userIndex = validUsers.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

      if (userIndex === -1) {
        return { success: false, message: 'User not found' };
      }

      // Prevent email change
      const { email: _, ...safeUpdates } = updates;

      // Update the user object
      validUsers[userIndex] = {
        ...validUsers[userIndex],
        ...safeUpdates
      };

      // Save updated users list
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(validUsers));

      // If updating current user, update session too
      if (user && user.email.toLowerCase() === email.toLowerCase()) {
        const updatedUser = {
          ...user,
          ...safeUpdates
        };
        setUser(updatedUser);
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
      }

      return { success: true, message: 'User updated successfully' };
    } catch (e) {
      console.log('updateUser error', e);
      return { success: false, message: 'Failed to update user' };
    }
  };

  // Admin: Delete user by email
  const deleteUser = async (email) => {
    try {
      // Prevent deleting yourself
      if (user && user.email.toLowerCase() === email.toLowerCase()) {
        return { success: false, message: 'Cannot delete your own account' };
      }

      const users = await getRegisteredUsers();
      const validUsers = users.filter(u => u && u.email);
      const filteredUsers = validUsers.filter(u => u.email.toLowerCase() !== email.toLowerCase());

      if (filteredUsers.length === validUsers.length) {
        return { success: false, message: 'User not found' };
      }

      // Save updated users list
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));

      return { success: true, message: 'User deleted successfully' };
    } catch (e) {
      console.log('deleteUser error', e);
      return { success: false, message: 'Failed to delete user' };
    }
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
    <AuthContext.Provider value={{ 
      user, 
      register, 
      login, 
      logout, 
      updateProfile, 
      updateUser, 
      deleteUser, 
      getRegisteredUsers 
    }}>
      {children}
    </AuthContext.Provider>
  );
};