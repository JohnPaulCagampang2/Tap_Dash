import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function CounterApp() {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Counter App</Text>
      <Text style={styles.counter}>{count}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => setCount(count + 1)}>
          <Text style={styles.buttonText}>Increment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => setCount(count - 1)}>
          <Text style={styles.buttonText}>Decrement</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  counter: {
    fontSize: 40,
    fontWeight: 'bold'
  },
  buttonRow: {
    flexDirection: 'row',
    
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});