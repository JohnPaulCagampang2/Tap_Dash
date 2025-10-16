import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext.js';

export default function LeaderboardScreen() {
  const { user } = useContext(AuthContext);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await AsyncStorage.getItem('leaderboard');
        if (data) {
          const parsed = JSON.parse(data);
          // Sort by highest score first
          parsed.sort((a, b) => b.bestScore - a.bestScore);
          setLeaderboard(parsed);
        }
      } catch (error) {
        console.log('Error loading leaderboard:', error);
      }
    };

    loadLeaderboard();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Leaderboard</Text>
      {leaderboard.length === 0 ? (
        <Text style={styles.noData}>No scores yet — play a game to be first!</Text>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.item,
                item.username === user?.username && styles.currentUser,
              ]}
            >
              <Text style={styles.rank}>#{index + 1}</Text>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.score}>{item.bestScore}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 6,
    elevation: 2,
  },
  currentUser: {
    backgroundColor: '#e3f2fd',
  },
  rank: { fontSize: 18, fontWeight: 'bold', color: '#555' },
  username: { fontSize: 18 },
  score: { fontSize: 18, fontWeight: 'bold', color: '#2196F3' },
  noData: {
    textAlign: 'center',
    marginTop: 50,
    color: '#777',
    fontSize: 16,
  },
});
