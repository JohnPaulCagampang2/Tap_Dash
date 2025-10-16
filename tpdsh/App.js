import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const SESSION_TIME = 30; // 30 seconds per session
const POINTS_PER_TAP = 1;
const LEVEL_THRESHOLD = 10; // Level up every 10 points

const App = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(SESSION_TIME);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [targetSize, setTargetSize] = useState(80); // Starts large, shrinks with levels
  const [targetPosition, setTargetPosition] = useState({ x: width / 2 - 40, y: height / 2 - 40 });

  useEffect(() => {
    loadHighScore();
  }, []);

  useEffect(() => {
    let interval;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  const loadHighScore = async () => {
    try {
      const saved = await AsyncStorage.getItem('tapdash_highscore');
      if (saved) setHighScore(parseInt(saved, 10));
    } catch (error) {
      console.error('Error loading high score:', error);
    }
  };

  const saveHighScore = async (newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      try {
        await AsyncStorage.setItem('tapdash_highscore', newScore.toString());
      } catch (error) {
        console.error('Error saving high score:', error);
      }
    }
  };

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setTimeLeft(SESSION_TIME);
    setTargetSize(80);
    setTargetPosition({ x: width / 2 - 40, y: height / 2 - 40 });
    setIsPlaying(true);
  };

  const handleTap = () => {
    if (!isPlaying) return;

    const newScore = score + POINTS_PER_TAP;
    setScore(newScore);

    // Level progression: Shrink target and reposition randomly
    const newLevel = Math.floor(newScore / LEVEL_THRESHOLD) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      const size = Math.max(30, 80 - (newLevel - 1) * 10); // Shrink by 10px per level, min 30px
      setTargetSize(size);

      // Random reposition within bounds (for reflex challenge)
      const maxX = width - size;
      const maxY = height * 0.6 - size; // Keep it in lower half for visibility
      setTargetPosition({
        x: Math.random() * maxX,
        y: height * 0.3 + Math.random() * maxY,
      });
    }
  };

  const endGame = () => {
    setIsPlaying(false);
    saveHighScore(score);
    Alert.alert(
      'Game Over!',
      `Score: ${score}\nLevel Reached: ${level}\nHigh Score: ${Math.max(score, highScore)}`,
      [{ text: 'Play Again', onPress: startGame }]
    );
  };

  const renderGame = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.level}>Level: {level}</Text>
        <Text style={styles.time}>Time: {timeLeft}s</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.target,
          {
            width: targetSize,
            height: targetSize,
            left: targetPosition.x,
            top: targetPosition.y,
          },
        ]}
        onPress={handleTap}
        activeOpacity={0.7}
      />

      <View style={styles.footer}>
        <Text style={styles.highScore}>High Score: {highScore}</Text>
      </View>
    </View>
  );

  const renderStartScreen = () => (
    <View style={styles.container}>
      <Text style={styles.title}>TapDash</Text>
      <Text style={styles.description}>Tap the target as fast as you can! Difficulty increases with levels.</Text>
      <TouchableOpacity style={styles.startButton} onPress={startGame}>
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>
      <Text style={styles.highScore}>Best: {highScore}</Text>
    </View>
  );

  return isPlaying ? renderGame() : renderStartScreen();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  startButton: {
    backgroundColor: '#16213e',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 50,
  },
  score: {
    fontSize: 24,
    color: '#0f3460',
    fontWeight: 'bold',
  },
  level: {
    fontSize: 24,
    color: '#e94560',
    fontWeight: 'bold',
  },
  time: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  target: {
    backgroundColor: '#e94560',
    borderRadius: 40,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  highScore: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
});

export default App;
