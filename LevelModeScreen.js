‎import React, { useState, useEffect } from 'react';
‎import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
‎import { scoreService } from '../../services/scoreService';
‎
‎export default function LevelModeScreen({ navigation }) {
‎  const [score, setScore] = useState(0);
‎  const [timeLeft, setTimeLeft] = useState(10); // start 10s
‎  const [running, setRunning] = useState(true);
‎
‎  useEffect(() => {
‎    if (!running) return;
‎    if (timeLeft <= 0) {
‎      finish();
‎      return;
‎    }
‎    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
‎    return () => clearTimeout(t);
‎  }, [timeLeft, running]);
‎
‎  const onTap = () => setScore(s => s + 1);
‎
‎  const finish = async () => {
‎    setRunning(false);
‎    try {
‎      await scoreService.saveScore('level', score);
‎      navigation.navigate('Leaderboard');
‎    } catch(e){}
‎  };
‎
‎  return (
‎    <View style={styles.container}>
‎      <Text style={styles.title}>Level Mode</Text>
‎      <Text>Time: {timeLeft}s</Text>
‎      <Text style={styles.score}>{score}</Text>
‎
‎      <TouchableOpacity style={styles.tapArea} onPress={onTap}><Text style={{fontSize:24}}>TAP</Text></TouchableOpacity>
‎      <TouchableOpacity style={styles.endBtn} onPress={finish}><Text>End Level</Text></TouchableOpacity>
‎    </View>
‎  );
‎}
‎
‎const styles = StyleSheet.create({
‎  container:{flex:1,alignItems:'center',padding:20},
‎  title:{fontSize:24,fontWeight:'700',marginTop:20},
‎  score:{fontSize:48,fontWeight:'800',marginVertical:12},
‎  tapArea:{width:200,height:200,borderRadius:100,backgroundColor:'#efefef',justifyContent:'center',alignItems:'center'},
‎  endBtn:{marginTop:20,padding:12,backgroundColor:'#ddd',borderRadius:8}
‎});
‎