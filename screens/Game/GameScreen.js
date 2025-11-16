import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { AuthContext } from '../../context/AuthContext';
import { GameContext } from '../../context/GameContext';

const { width } = Dimensions.get('window');

export default function GameScreen() {
  const { user } = useContext(AuthContext);
  const { saveScore, getBestForCurrentUser } = useContext(GameContext);

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);
  const [dashes, setDashes] = useState([]);

  const scoreAnim = useRef(new Animated.Value(1)).current;
  const popAnim = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const timerShake = useRef(new Animated.Value(0)).current;

  // Load best score
  useEffect(() => {
    const loadBest = async () => {
      const b = await getBestForCurrentUser();
      setBestScore(b || 0);
    };
    loadBest();
  }, [user]);

  // Countdown timer with warning shake
  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 3 && t > 0) {
            // Shake animation when time is running out
            Animated.sequence([
              Animated.timing(timerShake, { toValue: 10, duration: 50, useNativeDriver: true }),
              Animated.timing(timerShake, { toValue: -10, duration: 50, useNativeDriver: true }),
              Animated.timing(timerShake, { toValue: 10, duration: 50, useNativeDriver: true }),
              Animated.timing(timerShake, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();
          }
          return t - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      handleGameOver();
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  // Pulse animation for start button
  useEffect(() => {
    if (!isPlaying && !gameOver && !showCountdown) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonPulse, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(buttonPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      buttonPulse.setValue(1);
    }
  }, [isPlaying, gameOver, showCountdown]);

  // Animate score + pop
  const animateScore = () => {
    scoreAnim.setValue(1);
    popAnim.setValue(1);
    Animated.spring(scoreAnim, { toValue: 1.3, friction: 4, useNativeDriver: true }).start(() => {
      Animated.spring(scoreAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
    });
    Animated.timing(popAnim, { toValue: 0, duration: 600, useNativeDriver: true }).start();
  };

  // Spawn dashes on tap with varied colors
  const spawnDash = () => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#F7B731', '#5F27CD'];
    const numDashes = 8;
    const newDashes = Array.from({ length: numDashes }).map((_, i) => {
      const id = Math.random().toString();
      const angle = (Math.PI * 2 * i) / numDashes + (Math.random() - 0.5) * 0.5;
      const distance = 70 + Math.random() * 50;
      const anim = new Animated.Value(0);
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      Animated.timing(anim, { 
        toValue: 1, 
        duration: 500, 
        useNativeDriver: true 
      }).start(() => {
        setDashes(prev => prev.filter(d => d.id !== id));
      });
      
      return { id, angle, distance, anim, color };
    });
    setDashes(prev => [...prev, ...newDashes]);
  };

  // Start game with countdown
  const startGame = () => {
    setScore(0);
    setTimeLeft(10);
    setGameOver(false);
    setShowConfetti(false);
    setShowCountdown(true);
    setCountdown(3);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(interval);
        setShowCountdown(false);
        setIsPlaying(true);
      }
    }, 1000);
  };

  const handleTap = () => {
    if (!isPlaying) return;
    setScore(s => s + 1);
    animateScore();
    spawnDash();
  };

  const handleGameOver = async () => {
    setGameOver(true);
    setIsPlaying(false);

    try {
      if (!user?.username) {
        Alert.alert(
          'Game Over',
          `Your Score: ${score} taps\n\n⚠️ You're not logged in\nScore was not saved.`,
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      const saved = await saveScore(score);
      const newBest = await getBestForCurrentUser();
      setBestScore(newBest || 0);

      if (saved && score >= newBest && score > 0) {
        setShowConfetti(true);
        Alert.alert(
          '🏆 New High Score!',
          `Amazing! You scored ${score} taps!\n\nPrevious best: ${bestScore}`,
          [{ text: 'Awesome!', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Game Over',
          `Your Score: ${score} taps\nYour Best: ${newBest} taps`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (err) {
      console.log('Error on game over:', err);
      Alert.alert('Error', 'Failed to save score. Please try again.');
    }
  };

  const getTimerColor = () => {
    if (timeLeft <= 3) return '#EF4444';
    if (timeLeft <= 5) return '#F59E0B';
    return '#10B981';
  };

  return (
    <View style={styles.container}>
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />

      {showCountdown ? (
        <View style={styles.countdownContainer}>
          <Animated.Text style={[styles.countdownText, { transform: [{ scale: scoreAnim }] }]}>
            {countdown > 0 ? countdown : ''}
          </Animated.Text>
          {countdown === 0 && (
            <Animated.Text style={[styles.goText, { transform: [{ scale: scoreAnim }] }]}>
              GO!
            </Animated.Text>
          )}
          <Text style={styles.countdownHint}>Get ready to tap!</Text>
        </View>
      ) : (
        <>
          {/* Stats Header */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Ionicons name="trophy" size={24} color="#F59E0B" />
              <Text style={styles.statLabel}>Best</Text>
              <Text style={styles.statValue}>{bestScore}</Text>
            </View>

            <Animated.View style={[styles.timerBox, { 
              transform: [{ translateX: timerShake }],
              backgroundColor: timeLeft <= 3 ? '#FEE2E2' : timeLeft <= 5 ? '#FEF3C7' : '#D1FAE5'
            }]}>
              <Ionicons 
                name="timer-outline" 
                size={28} 
                color={getTimerColor()} 
              />
              <Text style={[styles.timerText, { color: getTimerColor() }]}>
                {timeLeft}s
              </Text>
            </Animated.View>

            <View style={styles.statBox}>
              <Ionicons name="finger-print" size={24} color="#3B82F6" />
              <Text style={styles.statLabel}>Score</Text>
              <Animated.Text style={[styles.statValue, { transform: [{ scale: scoreAnim }] }]}>
                {score}
              </Animated.Text>
            </View>
          </View>

          {/* Pop score animation */}
          <Animated.View
            style={[
              styles.popScoreContainer,
              {
                opacity: popAnim,
                transform: [
                  { translateY: popAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -60] }) },
                  { scale: popAnim.interpolate({ inputRange: [0, 1], outputRange: [1.5, 0.8] }) }
                ],
              },
            ]}
          >
            <Text style={styles.popScore}>+1</Text>
          </Animated.View>

          {/* Tap dashes */}
          {dashes.map(d => {
            const x = d.anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.cos(d.angle) * d.distance],
            });
            const y = d.anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.sin(d.angle) * d.distance],
            });
            const opacity = d.anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
            const scale = d.anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] });

            return (
              <Animated.View
                key={d.id}
                style={[
                  styles.dash,
                  {
                    backgroundColor: d.color,
                    transform: [
                      { translateX: x },
                      { translateY: y },
                      { scale },
                      { rotate: `${d.angle * (180 / Math.PI)}deg` }
                    ],
                    opacity,
                  }
                ]}
              />
            );
          })}

          {/* Main game area */}
          <View style={styles.gameArea}>
            {!isPlaying && !gameOver && !showCountdown && (
              <View style={styles.welcomeContainer}>
                <Ionicons name="game-controller" size={64} color="#3B82F6" style={{ marginBottom: 16 }} />
                <Text style={styles.welcomeTitle}>Tap Dash Challenge</Text>
                <Text style={styles.welcomeSubtitle}>
                  Tap as fast as you can in 10 seconds!
                </Text>
                <Animated.View style={{ transform: [{ scale: buttonPulse }] }}>
                  <TouchableOpacity style={styles.startButton} onPress={startGame}>
                    <Ionicons name="play" size={24} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.startButtonText}>Start Game</Text>
                  </TouchableOpacity>
                </Animated.View>
                {user ? (
                  <Text style={styles.userInfo}>Playing as {user.displayName || user.username}</Text>
                ) : (
                  <Text style={styles.warningText}>⚠️ Login to save your scores</Text>
                )}
              </View>
            )}

            {isPlaying && (
              <TouchableOpacity 
                style={styles.tapButton} 
                onPress={handleTap}
                activeOpacity={0.7}
              >
                <Ionicons name="hand-left" size={48} color="#fff" style={{ marginBottom: 8 }} />
                <Text style={styles.tapText}>TAP!</Text>
                <Text style={styles.tapHint}>Tap anywhere here</Text>
              </TouchableOpacity>
            )}

            {gameOver && (
              <View style={styles.gameOverContainer}>
                <Ionicons 
                  name={score >= bestScore ? "trophy" : "flag"} 
                  size={64} 
                  color={score >= bestScore ? "#F59E0B" : "#6B7280"} 
                  style={{ marginBottom: 16 }}
                />
                <Text style={styles.gameOverTitle}>Game Over!</Text>
                <Text style={styles.finalScore}>{score} taps</Text>
                
                {score >= bestScore && score > 0 ? (
                  <View style={styles.achievementBadge}>
                    <Text style={styles.achievementText}>🎉 New Record!</Text>
                  </View>
                ) : (
                  <Text style={styles.encouragement}>
                    Keep trying! Best: {bestScore}
                  </Text>
                )}

                <TouchableOpacity style={styles.playAgainButton} onPress={startGame}>
                  <Ionicons name="refresh" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.playAgainText}>Play Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {showConfetti && (
            <ConfettiCannon 
              count={150} 
              origin={{ x: width / 2, y: 0 }} 
              fadeOut={true} 
              fallSpeed={2500}
              explosionSpeed={350}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F0F9FF',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F0F9FF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 12
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '600'
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4
  },
  timerBox: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  timerText: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4
  },
  popScoreContainer: {
    position: 'absolute',
    top: '35%',
    alignItems: 'center'
  },
  popScore: {
    fontSize: 40,
    fontWeight: '800',
    color: '#10B981',
    textShadowColor: 'rgba(16, 185, 129, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8
  },
  dash: {
    position: 'absolute',
    width: 20,
    height: 4,
    borderRadius: 2,
    top: '50%',
    left: '50%'
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  welcomeContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 24,
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center'
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center'
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700'
  },
  userInfo: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280'
  },
  warningText: {
    marginTop: 16,
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600'
  },
  tapButton: {
    backgroundColor: '#3B82F6',
    width: 240,
    height: 240,
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    borderWidth: 8,
    borderColor: '#60A5FA'
  },
  tapText: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 2
  },
  tapHint: {
    color: '#DBEAFE',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '600'
  },
  gameOverContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 24,
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8
  },
  finalScore: {
    fontSize: 48,
    fontWeight: '900',
    color: '#3B82F6',
    marginBottom: 16
  },
  achievementBadge: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24
  },
  achievementText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F59E0B'
  },
  encouragement: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24
  },
  playAgainButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  playAgainText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  countdownText: {
    fontSize: 120,
    fontWeight: '900',
    color: '#3B82F6',
    textShadowColor: 'rgba(59, 130, 246, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12
  },
  goText: {
    fontSize: 80,
    fontWeight: '900',
    color: '#10B981',
    textShadowColor: 'rgba(16, 185, 129, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12
  },
  countdownHint: {
    fontSize: 20,
    color: '#6B7280',
    marginTop: 20,
    fontWeight: '600'
  }
});