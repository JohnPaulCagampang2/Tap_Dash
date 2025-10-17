import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';

export default function GameScreen() {
  const { user } = useContext(AuthContext);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const loadBestScore = async () => {
      try {
        const storedScore = await AsyncStorage.getItem('bestScore');
        if (storedScore) setBestScore(Number(storedScore));
      } catch (error) {
        console.log('Error loading best score:', error);
      }
    };
    loadBestScore();
  }, []);

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      handleGameOver();
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(10);
    setGameOver(false);
    setIsPlaying(true);
  };

  const handleTap = () => {
    if (isPlaying) setScore(s => s + 1);
  };

  const handleGameOver = async () => {
    setGameOver(true);
    setIsPlaying(false);

    let newBest = bestScore;
    if (score > bestScore) {
      try {
        await AsyncStorage.setItem('bestScore', score.toString());
        setBestScore(score);
        newBest = score;
        Alert.alert('🏆 New High Score!', `You set a new record of ${score} points!`);
      } catch (error) {
        console.log('Error saving best score:', error);
      }
    } else {
      Alert.alert('Game Over', `Your score: ${score}\nBest: ${bestScore}`);
    }

    try {
      const stored = await AsyncStorage.getItem('leaderboard');
      const leaderboard = stored ? JSON.parse(stored) : [];
      const existing = leaderboard.find(p => p.username === user?.username);
      if (existing) {
        existing.bestScore = Math.max(existing.bestScore, newBest);
      } else {
        leaderboard.push({
          username: user?.username || 'Guest',
          bestScore: newBest,
        });
      }
      leaderboard.sort((a, b) => b.bestScore - a.bestScore);
      await AsyncStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    } catch (error) {
      console.log('Error updating leaderboard:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>🎮 TapDash</Text>
        <Text style={styles.userText}>Welcome, {user?.username || 'Guest'}!</Text>

        <View style={styles.statsBox}>
          <Text style={styles.statText}>⏱ {timeLeft}s</Text>
          <Text style={styles.statText}>🎯 Score: {score}</Text>
          <Text style={styles.bestText}>🏆 Best: {bestScore}</Text>
        </View>

        {!isPlaying && !gameOver && (
          <TouchableOpacity style={styles.startBtn} onPress={startGame}>
            <Text style={styles.startText}>Start Game</Text>
          </TouchableOpacity>
        )}

        {isPlaying && (
          <TouchableOpacity style={styles.tapButton} onPress={handleTap}>
            <Text style={styles.tapText}>TAP!</Text>
          </TouchableOpacity>
        )}

        {gameOver && (
          <View style={styles.gameOverBox}>
            <Text style={styles.gameOverText}>💀 Game Over!</Text>
            <TouchableOpacity style={styles.playAgainBtn} onPress={startGame}>
              <Text style={styles.playAgainText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 30,
    color: '#0077b6',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userText: {
    color: '#555',
    fontSize: 16,
    marginBottom: 20,
  },
  statsBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  statText: {
    color: '#333',
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 4,
  },
  bestText: {
    color: '#0096c7',
    fontSize: 18,
    marginTop: 8,
  },
  startBtn: {
    backgroundColor: '#48cae4',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 12,
    elevation: 2,
  },
  startText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  tapButton: {
    backgroundColor: '#90e0ef',
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    borderWidth: 3,
    borderColor: '#00b4d8',
  },
  tapText: {
    color: '#023e8a',
    fontSize: 28,
    fontWeight: 'bold',
  },
  gameOverBox: {
    alignItems: 'center',
    marginTop: 20,
  },
  gameOverText: {
    fontSize: 22,
    color: '#ef233c',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  playAgainBtn: {
    backgroundColor: '#00b4d8',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  playAgainText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
