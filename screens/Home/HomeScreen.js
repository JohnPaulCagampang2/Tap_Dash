import React, { useContext, useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const { width: W, height: H } = Dimensions.get('window');
const EMOJI_SET = ['🎮', '⭐', '🏆', '✨', '🔥', '🎉', '💎', '🌟'];

export default function HomeScreen({ navigation }) {
  const { logout, user } = useContext(AuthContext);

  // Animations
  const welcomeAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const navAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Particles state
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      Animated.spring(welcomeAnim, { 
        toValue: 1, 
        friction: 8, 
        tension: 40,
        useNativeDriver: true 
      }),
      Animated.spring(cardAnim, { 
        toValue: 1, 
        friction: 8, 
        tension: 40,
        delay: 100,
        useNativeDriver: true 
      }),
      Animated.spring(navAnim, { 
        toValue: 1, 
        friction: 8, 
        tension: 40,
        delay: 150,
        useNativeDriver: true 
      }),
    ]).start();

    // Continuous pulse animation for welcome card
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { 
          toValue: 1.02, 
          duration: 2000,
          useNativeDriver: true 
        }),
        Animated.timing(pulseAnim, { 
          toValue: 1, 
          duration: 2000,
          useNativeDriver: true 
        }),
      ])
    ).start();

    // Spawn particles periodically
    const spawnInterval = setInterval(() => spawnParticleBurst(), 1500);
    return () => clearInterval(spawnInterval);
  }, []);

  // Button press animations
  const animateButton = (scale) => {
    return Animated.spring(scale, { 
      toValue: 0.95, 
      friction: 3,
      useNativeDriver: true 
    });
  };

  const resetButton = (scale) => {
    return Animated.spring(scale, { 
      toValue: 1, 
      friction: 3,
      useNativeDriver: true 
    });
  };

  // Create a single particle animation object
  const spawnParticle = (emoji, startX, startY) => {
    const id = Math.random().toString(36).slice(2, 9);
    const animY = new Animated.Value(0);
    const animX = new Animated.Value(0);
    const animOpacity = new Animated.Value(0);
    const animScale = new Animated.Value(0);
    const size = 16 + Math.round(Math.random() * 16);
    const x = startX + (Math.random() * 100 - 50);
    const y = startY;
    const rotate = new Animated.Value(0);
    const drift = (Math.random() - 0.5) * 100;

    const particle = { id, emoji, animY, animX, animOpacity, animScale, rotate, x, y, size };
    setParticles(prev => [...prev, particle]);

    // Entrance animation
    Animated.parallel([
      Animated.spring(animScale, { 
        toValue: 1, 
        friction: 4,
        useNativeDriver: true 
      }),
      Animated.timing(animOpacity, { 
        toValue: 1, 
        duration: 200,
        useNativeDriver: true 
      }),
    ]).start(() => {
      // Float animation
      Animated.parallel([
        Animated.timing(animY, { 
          toValue: -200 - Math.random() * 100, 
          duration: 3000 + Math.random() * 1000,
          useNativeDriver: true 
        }),
        Animated.timing(animX, { 
          toValue: drift, 
          duration: 3000 + Math.random() * 1000,
          useNativeDriver: true 
        }),
        Animated.timing(animOpacity, { 
          toValue: 0, 
          duration: 2500 + Math.random() * 1000,
          useNativeDriver: true 
        }),
        Animated.timing(rotate, { 
          toValue: Math.random() > 0.5 ? 360 : -360, 
          duration: 3000,
          useNativeDriver: true 
        }),
      ]).start(() => {
        setParticles(prev => prev.filter(p => p.id !== id));
      });
    });
  };

  // Spawn particles around the welcome card
  const spawnParticleBurst = () => {
    const burstCount = 4 + Math.floor(Math.random() * 3);
    const centerX = W / 2;
    const centerY = H * 0.35;
    
    for (let i = 0; i < burstCount; i++) {
      const emoji = EMOJI_SET[Math.floor(Math.random() * EMOJI_SET.length)];
      setTimeout(() => spawnParticle(emoji, centerX, centerY), i * 120);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Background gradient effect */}
        <View style={styles.bgGradient} />
        
        {/* Floating particles */}
        {particles.map(p => (
          <Animated.Text
            key={p.id}
            style={[
              styles.particle,
              {
                left: p.x,
                top: p.y,
                transform: [
                  { translateY: p.animY },
                  { translateX: p.animX },
                  { scale: p.animScale },
                  { rotate: p.rotate.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg']
                    })
                  }
                ],
                opacity: p.animOpacity,
                fontSize: p.size,
              },
            ]}
          >
            {p.emoji}
          </Animated.Text>
        ))}

        <View style={styles.contentContainer}>
          {/* Welcome Card with enhanced styling */}
          <Animated.View
            style={[
              styles.welcomeCard,
              {
                transform: [
                  { 
                    translateY: welcomeAnim.interpolate({ 
                      inputRange: [0, 1], 
                      outputRange: [-60, 0] 
                    }) 
                  },
                  { scale: Animated.multiply(welcomeAnim, pulseAnim) },
                ],
                opacity: welcomeAnim,
              },
            ]}
          >
            <View style={styles.welcomeGlow} />
            <Text style={styles.welcomeEmoji}>👋</Text>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.username}>{user?.username || 'Player'}</Text>
            <View style={styles.divider} />
            <Text style={styles.miniText}>Ready to start your next adventure?</Text>
          </Animated.View>

          {/* Main Action Card with glass effect */}
          <Animated.View
            style={[
              styles.card,
              {
                transform: [
                  { 
                    translateY: cardAnim.interpolate({ 
                      inputRange: [0, 1], 
                      outputRange: [60, 0] 
                    }) 
                  },
                  { scale: cardAnim },
                ],
                opacity: cardAnim,
              },
            ]}
          >
            <GameButton 
              label="🎮 Play Game"
              onPress={() => navigation.navigate('Game')}
              style={styles.primary}
            />

            <GameButton 
              label="🏆 Leaderboard"
              onPress={() => navigation.navigate('Leaderboard')}
              style={styles.secondary}
            />
          </Animated.View>
        </View>

        {/* Enhanced Bottom Navigation */}
        <Animated.View
          style={[
            styles.bottomNav,
            {
              transform: [
                { 
                  translateY: navAnim.interpolate({ 
                    inputRange: [0, 1], 
                    outputRange: [100, 0] 
                  }) 
                },
              ],
              opacity: navAnim,
            },
          ]}
        >
          <TouchableOpacity onPress={() => navigation.navigate('User')} style={styles.navItem}>
            <View style={styles.navIconContainer}>
              <Text style={styles.navIcon}>👤</Text>
            </View>
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={logout} 
            style={[styles.navItem, styles.logoutButton]}
          >
            <View style={[styles.navIconContainer, styles.logoutIcon]}>
              <Text style={styles.navIcon}>🚪</Text>
            </View>
            <Text style={[styles.navText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

// Reusable Game Button Component
function GameButton({ label, onPress, style }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { 
      toValue: 0.95, 
      friction: 3,
      useNativeDriver: true 
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { 
      toValue: 1, 
      friction: 3,
      useNativeDriver: true 
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
      <TouchableOpacity
        style={[styles.button, style]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Text style={styles.buttonText}>{label}</Text>
        <View style={styles.buttonShine} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: H * 0.5,
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  /* Floating particle */
  particle: {
    position: 'absolute',
    zIndex: 100,
    textAlign: 'center',
  },

  /* Welcome Card */
  welcomeCard: {
    backgroundColor: '#3B82F6',
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 28,
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  welcomeGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    backgroundColor: '#60A5FA',
    borderRadius: 75,
    opacity: 0.2,
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  welcomeText: {
    color: '#BFDBFE',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  username: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  divider: {
    height: 2,
    backgroundColor: '#60A5FA',
    width: 60,
    borderRadius: 1,
    marginVertical: 12,
    opacity: 0.5,
  },
  miniText: {
    color: '#DBEAFE',
    fontSize: 15,
    fontWeight: '500',
  },

  /* Main Card */
  card: {
    backgroundColor: '#1E293B',
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 6,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  buttonShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  primary: {
    backgroundColor: '#3B82F6',
  },
  secondary: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.3,
  },

  /* Bottom Navigation */
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  navIcon: {
    fontSize: 22,
  },
  navText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  logoutButton: {
    opacity: 0.9,
  },
  logoutIcon: {
    backgroundColor: '#DC2626',
  },
  logoutText: {
    color: '#FCA5A5',
  },
});