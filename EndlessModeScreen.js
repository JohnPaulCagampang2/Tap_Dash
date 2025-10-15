
‎import React, { useState, useRef, useEffect } from 'react';
‎import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
‎import { scoreService } from '../../services/scoreService';
‎
‎export default function EndlessModeScreen({ navigation }) {
‎  const [score, setScore] = useState(0);
‎  const [running, setRunning] = useState(false);
‎
‎  const onTap = () => {
‎    if (!running) setRunning(true);
‎    setScore(s => s + 1);
‎  };
‎
‎  const onEnd = async () => {
‎    setRunning(false);
‎    try {
‎      await scoreService.saveScore('endless', score);
‎      navigation.navigate('Leaderboard');
‎    } catch {}
‎  };
‎
‎  return (
‎    <View style={styles.container}>
‎      <Text style={styles.title}>Endless Mode</Text>
‎      <Text style={styles.score}>{score}</Text>
‎
‎      <TouchableOpacity style={styles.tapArea} onPress={onTap}>
‎        <Text style={{fontSize:24}}>TAP</Text>
‎      </TouchableOpacity>
‎
‎      <TouchableOpacity style={styles.endBtn} onPress={onEnd}><Text>Finish & Save</Text></TouchableOpacity>
‎    </View>
‎  );
‎}
‎
‎const styles = StyleSheet.create({
‎  container:{flex:1,alignItems:'center',padding:20},
‎  title:{fontSize:24,fontWeight:'700',marginTop:20},
‎  score:{fontSize:48,fontWeight:'800',marginVertical:24},
‎  tapArea:{width:200,height:200,borderRadius:100,backgroundColor:'#efefef',justifyContent:'center',alignItems:'center'},
‎  endBtn:{marginTop:20,padding:12,backgroundColor:'#ddd',borderRadius:8}
‎});
‎