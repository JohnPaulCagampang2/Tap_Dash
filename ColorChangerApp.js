import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ColorChangerApp() {
  const [bgColor, setBgColor] = useState('#ffffff');

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={styles.title}>Color Changer App</Text>

      <View style={styles.colorRow}>
        <TouchableOpacity 
          style={[styles.colorButton, { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#ccc' }]} 
          onPress={() => setBgColor('#ffffff')}
        >
          <Text style={styles.colorText}>White</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.colorButton, { backgroundColor: '#add8e6' }]} 
          onPress={() => setBgColor('#add8e6')}
        >
          <Text style={styles.colorText}>Light Blue</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.colorButton, { backgroundColor: '#90ee90' }]} 
          onPress={() => setBgColor('#90ee90')}
        >
          <Text style={styles.colorText}>Light Green</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,  // <-- katunga sa screen kay gi handle sa App.js
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderTopWidth: 2,
    borderColor: '#ccc'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  colorRow: {
    flexDirection: 'row',
    gap: 15
  },
  colorButton: {
    padding: 15,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center'
  },
  colorText: {
    fontWeight: 'bold'
  }
});