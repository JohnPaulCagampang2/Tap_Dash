// screens/Admin/AdminScreen.js
import React, { useContext, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  TextInput,
  Modal,
  Image,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

// 🔒 ADMIN CREDENTIALS - MUST MATCH AuthContext.js!
const ADMIN_EMAIL = 'admindev@gmail.com';
const ADMIN_PASSWORD = 'admin123';  // ⚠️ CHANGE THIS TO A SECURE PASSWORD!

export default function AdminScreen() {
  const { user, getRegisteredUsers, updateUser, deleteUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    displayName: '',
    password: ''
  });

  // Password protection state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check if current user's email matches admin email
  const isAdminEmail = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

  const loadUsers = async () => {
    setLoading(true);
    const allUsers = await getRegisteredUsers();
    setUsers(allUsers);
    setLoading(false);
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordInput('');
    } else {
      Alert.alert('Access Denied', 'Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  const handleEdit = (userToEdit) => {
    setSelectedUser(userToEdit);
    setEditForm({
      username: userToEdit.username || '',
      email: userToEdit.email || '',
      displayName: userToEdit.displayName || '',
      password: ''
    });
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.email || !editForm.username) {
      Alert.alert('Error', 'Email and username are required');
      return;
    }

    const updates = {
      username: editForm.username,
      displayName: editForm.displayName
    };

    if (editForm.password && editForm.password.trim() !== '') {
      updates.password = editForm.password;
    }

    const result = await updateUser(selectedUser.email, updates);
    if (result.success) {
      Alert.alert('✓ Success', 'User updated successfully');
      setModalVisible(false);
      loadUsers();
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleDelete = (userToDelete) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userToDelete.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteUser(userToDelete.email);
            if (result.success) {
              Alert.alert('✓ Success', 'User deleted successfully');
              loadUsers();
            } else {
              Alert.alert('Error', result.message);
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from admin panel?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => setIsAuthenticated(false)
        }
      ]
    );
  };

  // ACCESS DENIED - Not admin email
  if (!isAdminEmail) {
    return (
      <View style={styles.container}>
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed" size={64} color="#EF4444" />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            You don't have permission to access the admin panel.
          </Text>
          <Text style={styles.adminEmailText}>
            Admin Email: {ADMIN_EMAIL}
          </Text>
          <Text style={styles.currentEmailText}>
            Your Email: {user?.email || 'Not logged in'}
          </Text>
        </View>
      </View>
    );
  }

  // PASSWORD PROTECTION SCREEN
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.loginContainer}>
          <View style={styles.loginHeader}>
            <Ionicons name="shield-checkmark" size={72} color="#2563EB" />
            <Text style={styles.loginTitle}>Admin Panel</Text>
            <Text style={styles.loginSubtitle}>Enter password to continue</Text>
          </View>

          <View style={styles.loginForm}>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={passwordInput}
                onChangeText={setPasswordInput}
                placeholder="Enter admin password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onSubmitEditing={handlePasswordSubmit}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={22} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handlePasswordSubmit}
            >
              <Ionicons name="lock-open" size={20} color="#fff" />
              <Text style={styles.loginButtonText}>Unlock Panel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loginInfo}>
            <Ionicons name="information-circle" size={20} color="#6B7280" />
            <Text style={styles.loginInfoText}>
              Logged in as: {user?.email}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // MAIN ADMIN PANEL (after authentication)
  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.avatarSection}>
          {item.photoURL ? (
            <Image source={{ uri: item.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
          )}
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>
                {item.displayName || item.username}
              </Text>
              {item.isAdmin && (
                <View style={styles.adminBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#2563EB" />
                  <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
              )}
            </View>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userUsername}>@{item.username}</Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.editBtn} 
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="pencil" size={18} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="shield-checkmark" size={28} color="#2563EB" />
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshBtn} onPress={loadUsers}>
            <Ionicons name="refresh" size={22} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color="#2563EB" />
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
      </View>

      {/* Users List */}
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item, index) => item.email + index}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
        refreshing={loading}
        onRefresh={loadUsers}
      />

      {/* Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit User</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={editForm.email}
                  editable={false}
                />
                <Text style={styles.helperText}>Email cannot be changed</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.username}
                  onChangeText={(text) => setEditForm({ ...editForm, username: text })}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Display Name</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.displayName}
                  onChangeText={(text) => setEditForm({ ...editForm, displayName: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.password}
                  onChangeText={(text) => setEditForm({ ...editForm, password: text })}
                  placeholder="Enter new password (leave blank to keep current)"
                  secureTextEntry
                />
                <Text style={styles.helperText}>Leave blank to keep the current password</Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={handleSaveEdit}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6'
  },
  // Login Screen Styles
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 30
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 40
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginTop: 20,
    marginBottom: 8
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#6B7280'
  },
  loginForm: {
    gap: 16
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative'
  },
  passwordInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 3,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  loginInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 30,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12
  },
  loginInfoText: {
    fontSize: 14,
    color: '#6B7280'
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827'
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  statsContainer: {
    padding: 20
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4
  },
  listContent: {
    padding: 20,
    paddingTop: 0
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center'
  },
  userInfo: {
    marginLeft: 12,
    flex: 1
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB'
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2
  },
  userUsername: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2
  },
  actions: {
    flexDirection: 'row',
    gap: 8
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827'
  },
  formGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  inputDisabled: {
    backgroundColor: '#F9FAFB',
    color: '#9CA3AF'
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 4
  },
  modalActions: {
    marginTop: 12,
    gap: 12
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6'
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600'
  },
  // Access Denied Styles
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16
  },
  adminEmailText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 8
  },
  currentEmailText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500'
  }
});