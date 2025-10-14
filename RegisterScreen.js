import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { authService } from '../../services/authService';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = async () => {
    try {
      await authService.register(email, password);
      Alert.alert('Account created','You can now login');
      navigation.replace('Login');
    } catch (err) {
      Alert.alert('Register failed', err.message || 'Try again');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} />
      <TextInput secureTextEntry placeholder="Password" style={styles.input} value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.btn} onPress={onRegister}><Text style={styles.btnText}>Register</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={styles.link}>Back to login</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:'center',alignItems:'center',padding:20},
  title:{fontSize:28,fontWeight:'700',marginBottom:24},
  input:{width:'100%',borderWidth:1,borderRadius:8,padding:12,marginBottom:12},
  btn:{backgroundColor:'#333',padding:12,borderRadius:8,width:'100%',alignItems:'center'},
  btnText:{color:'#fff',fontWeight:'600'},
  link:{marginTop:12,color:'#007bff'}
});
