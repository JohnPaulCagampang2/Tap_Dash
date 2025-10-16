import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { logout, user } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to TapDash 🕹️</Text>
      <Text style={styles.username}>Logged in as: {user?.username}</Text>

      <View style={styles.buttonContainer}>
        <Button title="🎮 Play Game" onPress={() => navigation.navigate('Game')} />
        <Button title="🏆 Leaderboard" onPress={() => navigation.navigate('Leaderboard')} />
        <Button title="👤 Profile" onPress={() => navigation.navigate('User')} />
      </View>

      <View style={{ marginTop: 40 }}>
        <Button title="🚪 Logout" color="red" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  username: { fontSize: 16, color: 'gray', marginBottom: 20 },
  buttonContainer: { width: '80%', gap: 10 },
});