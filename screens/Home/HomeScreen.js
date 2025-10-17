import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { logout, user } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 👋 Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.username}>{user?.username || 'Player'}</Text>
          <Text style={styles.miniText}>Ready to start your next game?</Text>
        </View>

        {/* 🎮 Main Action Card */}
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.button, styles.primary]}
            onPress={() => navigation.navigate('Game')}
          >
            <Text style={styles.buttonText}>🎮 Play Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondary]}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Text style={styles.buttonText}>🏆 Leaderboard</Text>
          </TouchableOpacity>
        </View>

        {/* 🔻 Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={logout} style={styles.navItem}>
            <Text style={styles.navText}>🚪 Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('User')} style={styles.navItem}>
            <Text style={styles.navText}>👤 Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 👋 Welcome Card */
  welcomeCard: {
    backgroundColor: '#2563EB',
    width: '90%',
    borderRadius: 18,
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  welcomeText: {
    color: '#E0E7FF',
    fontSize: 16,
    fontWeight: '500',
  },
  username: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  miniText: {
    color: '#BFDBFE',
    fontSize: 14,
    marginTop: 6,
  },

  /* 🧩 Main Card */
  card: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 35,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 100, // space for bottom nav
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginVertical: 8,
    elevation: 2,
  },
  primary: {
    backgroundColor: '#2563EB',
  },
  secondary: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  /* 🔻 Bottom Navigation Bar */
  bottomNav: {
    position: 'absolute',
    bottom: 15,
    width: '90%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  navItem: {
    padding: 6,
  },
  navText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
});
