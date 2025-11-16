import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { getTopScores } from '../../utils/db';

export default function LeaderboardScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const top = await getTopScores(50, true);
        setLeaderboard(top);
        
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (err) {
        console.log('Error loading top scores', err);
      } finally {
        setLoading(false);
      }
    };

    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  const getMedalColor = (rank) => {
    switch (rank) {
      case 1: return '#F59E0B';
      case 2: return '#9CA3AF';
      case 3: return '#CD7F32';
      default: return '#3B82F6';
    }
  };

  const renderItem = ({ item, index }) => {
    const isCurrentUser = item.username === user?.username;
    const rank = index + 1;
    const medal = getMedalIcon(rank);
    const medalColor = getMedalColor(rank);

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={[styles.item, isCurrentUser && styles.currentUser]}>
          <View style={styles.rankContainer}>
            {medal ? (
              <Text style={styles.medalEmoji}>{medal}</Text>
            ) : (
              <View style={[styles.rankBadge, { backgroundColor: rank <= 10 ? '#DBEAFE' : '#F3F4F6' }]}>
                <Text style={[styles.rankText, { color: rank <= 10 ? '#1E40AF' : '#6B7280' }]}>
                  #{rank}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.userInfo}>
            <View style={styles.userNameContainer}>
              <Text style={styles.username} numberOfLines={1}>
                {item.username}
              </Text>
              {isCurrentUser && (
                <View style={styles.youBadge}>
                  <Text style={styles.youText}>You</Text>
                </View>
              )}
            </View>
            <View style={styles.scoreRow}>
              <Ionicons name="finger-print" size={14} color="#6B7280" />
              <Text style={styles.tapCount}>{item.bestScore} taps</Text>
            </View>
          </View>

          <View style={[styles.scoreBadge, { backgroundColor: medalColor + '20' }]}>
            <Text style={[styles.score, { color: medalColor }]}>{item.bestScore}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Ionicons name="trophy" size={48} color="#F59E0B" />
      <Text style={styles.title}>Leaderboard</Text>
      <Text style={styles.subtitle}>Top {leaderboard.length} Players</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="flag-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Scores Yet</Text>
      <Text style={styles.emptyText}>Be the first to set a record!</Text>
      <TouchableOpacity 
        style={styles.playButton} 
        onPress={() => navigation.navigate('Game')}
      >
        <Ionicons name="game-controller" size={20} color="#fff" />
        <Text style={styles.playButtonText}>Play Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Background decoration */}
      <View style={styles.bgDecoration1} />
      <View style={styles.bgDecoration2} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading scores...</Text>
        </View>
      ) : (
        <>
          {renderHeader()}
          
          {leaderboard.length === 0 ? (
            renderEmpty()
          ) : (
            <FlatList
              data={leaderboard}
              keyExtractor={(item, idx) => String(idx)}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}

      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F0F9FF',
    paddingTop: 60,
  },
  bgDecoration1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#DBEAFE',
    opacity: 0.3,
    top: -50,
    right: -50,
  },
  bgDecoration2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#BFDBFE',
    opacity: 0.3,
    bottom: 150,
    left: -30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  headerContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  title: { 
    fontSize: 36, 
    fontWeight: '900',
    marginTop: 12,
    color: '#111827',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  currentUser: { 
    backgroundColor: '#DBEAFE',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  medalEmoji: {
    fontSize: 32,
  },
  rankBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: { 
    fontSize: 14,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  username: { 
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  youBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  youText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tapCount: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  scoreBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  score: { 
    fontSize: 20,
    fontWeight: '900',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  playButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 6,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  backText: { 
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});