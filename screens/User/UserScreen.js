// screens/User/UserScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';

export default function UserScreen() {
  const { user, logout, updateProfile } = useContext(AuthContext);
  const navigation = useNavigation();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant photo library access to change your profile picture');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      const res = await updateProfile({ photoURL: imageUri });
      
      if (res.success) {
        Alert.alert('✓ Success', 'Profile picture updated');
      } else {
        Alert.alert('Error', res.message || 'Failed to update profile picture');
      }
    }
  };

  const save = async () => {
    if (!displayName.trim()) {
      Alert.alert('Invalid', 'Display name cannot be empty');
      return;
    }
    const res = await updateProfile({ displayName: displayName.trim() });
    if (res.success) {
      Alert.alert('✓ Success', 'Your profile has been updated');
      setEditing(false);
    } else {
      Alert.alert('Error', res.message);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => logout() }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={pickImage}
          activeOpacity={0.7}
        >
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={40} color="#fff" />
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.username}>{user?.displayName || user?.username || 'User'}</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-circle-outline" size={22} color="#2563EB" />
          <Text style={styles.sectionTitle}>Profile Information</Text>
        </View>

        {/* Email Section */}
        <View style={styles.infoRow}>
          <View style={styles.infoLabel}>
            <Ionicons name="mail-outline" size={20} color="#6B7280" />
            <Text style={styles.labelText}>Email</Text>
          </View>
          <Text style={styles.valueText}>{user?.email || '—'}</Text>
        </View>

        <View style={styles.divider} />

        {/* Display Name Section */}
        <View style={styles.infoRow}>
          <View style={styles.infoLabel}>
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <Text style={styles.labelText}>Display Name</Text>
          </View>
          
          {!editing ? (
            <View style={styles.editableRow}>
              <Text style={styles.valueText}>{user?.displayName || 'Not set'}</Text>
              <TouchableOpacity 
                onPress={() => { 
                  setEditing(true); 
                  setDisplayName(user?.displayName || ''); 
                }}
                style={styles.editButton}
              >
                <Ionicons name="pencil" size={18} color="#2563EB" />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.editContainer}>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter display name"
                style={styles.input}
                autoFocus
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.saveBtn} onPress={save}>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelBtn} 
                  onPress={() => {
                    setEditing(false);
                    setDisplayName(user?.displayName || '');
                  }}
                >
                  <Ionicons name="close" size={18} color="#6B7280" />
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Account Actions Card */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="settings-outline" size={22} color="#2563EB" />
          <Text style={styles.sectionTitle}>Account</Text>
        </View>

        {/* Admin Panel Button - Only show for admins */}
        {user?.isAdmin && (
          <>
            <TouchableOpacity 
              style={styles.adminButton} 
              onPress={() => navigation.navigate('Admin')}
            >
              <Ionicons name="shield-checkmark" size={22} color="#2563EB" />
              <Text style={styles.adminText}>Admin Panel</Text>
              <Ionicons name="chevron-forward" size={20} color="#2563EB" />
            </TouchableOpacity>
            <View style={styles.divider} />
          </>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <Text style={styles.appVersion}>TapDash v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F4F6' 
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4
  },
  username: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827'
  },
  card: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700',
    marginLeft: 8,
    color: '#111827'
  },
  infoRow: {
    paddingVertical: 12
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  labelText: { 
    color: '#6B7280', 
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600'
  },
  valueText: { 
    fontSize: 16, 
    color: '#111827',
    marginLeft: 28
  },
  editableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 28
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8
  },
  editText: { 
    color: '#2563EB', 
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14
  },
  editContainer: {
    marginLeft: 28,
    marginTop: 8
  },
  input: { 
    height: 48, 
    borderWidth: 1.5, 
    borderColor: '#2563EB', 
    borderRadius: 10, 
    paddingHorizontal: 14, 
    backgroundColor: '#fff',
    fontSize: 16
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10
  },
  saveBtn: { 
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2563EB', 
    paddingVertical: 12, 
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  saveText: { 
    color: '#fff', 
    fontWeight: '700',
    fontSize: 15
  },
  cancelBtn: { 
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6', 
    paddingVertical: 12, 
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  cancelText: { 
    color: '#6B7280', 
    fontWeight: '700',
    fontSize: 15
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8
  },
  adminButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 8
  },
  adminText: { 
    flex: 1,
    color: '#2563EB', 
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 12
  },
  logoutButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2'
  },
  logoutText: { 
    flex: 1,
    color: '#EF4444', 
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 12
  },
  appVersion: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 20
  }
});