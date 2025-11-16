// utils/MakeAdminScript.js
// Run this ONCE to make your account an admin
// You can call this from a temporary button or component

import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'tapdash_users';

export const makeUserAdmin = async (email) => {
  try {
    // Get all users
    const raw = await AsyncStorage.getItem(USERS_KEY);
    const users = raw ? JSON.parse(raw) : [];
    
    // Find your user and set isAdmin to true
    const updatedUsers = users.map(user => {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return { ...user, isAdmin: true };
      }
      return user;
    });
    
    // Save back
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    
    console.log('✅ Admin status granted to:', email);
    return { success: true, message: 'Admin status granted!' };
  } catch (error) {
    console.error('Error making admin:', error);
    return { success: false, message: 'Failed to grant admin status' };
  }
};

// Example usage in a component:
/*
import { makeUserAdmin } from './utils/MakeAdminScript';

// In a button press or useEffect:
const handleMakeAdmin = async () => {
  const result = await makeUserAdmin('your-email@example.com');
  Alert.alert(result.success ? 'Success' : 'Error', result.message);
};
*/