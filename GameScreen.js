//screens/Game/GameScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GameScreen() {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // 🧠 Load best score when the game starts
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

  // ⏱️ Timer logic
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

    if (score > bestScore) {
      try {
        await AsyncStorage.setItem('bestScore', score.toString());
        setBestScore(score);
        Alert.alert('🏆 New High Score!', `You set a new record of ${score} points!`);
      } catch (error) {
        console.log('Error saving best score:', error);
      }
    } else {
      Alert.alert('Game Over', `Your score: ${score}\nBest: ${bestScore}`);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 }}>
      <Text style={{ fontSize: 22 }}>⏱️ Time Left: {timeLeft}</Text>
      <Text style={{ fontSize: 26 }}>🎯 Score: {score}</Text>
      <Text style={{ fontSize: 20, color: 'gray' }}>🏆 Best Score: {bestScore}</Text>

      {!isPlaying && !gameOver && (
        <TouchableOpacity
          onPress={startGame}
          style={{
            backgroundColor: '#4CAF50',
            paddingVertical: 15,
            paddingHorizontal: 40,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: 'white', fontSize: 18 }}>Start Game</Text>
        </TouchableOpacity>
      )}

      {isPlaying && (
        <TouchableOpacity
          onPress={handleTap}
          style={{
            backgroundColor: '#2196F3',
            paddingVertical: 60,
            paddingHorizontal: 60,
            borderRadius: 999,
          }}
        >
          <Text style={{ color: 'white', fontSize: 24 }}>TAP!</Text>
        </TouchableOpacity>
      )}

      {gameOver && (
        <>
          <Text style={{ fontSize: 22, color: 'red' }}>Game Over!</Text>
          <TouchableOpacity
            onPress={startGame}
            style={{
              backgroundColor: '#f44336',
              paddingVertical: 10,
              paddingHorizontal: 30,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: 'white', fontSize: 18 }}>Play Again</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}


//context/GameContext.js

//This file has not been started yet