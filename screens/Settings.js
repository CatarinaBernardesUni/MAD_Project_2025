import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Settings({ navigation }) {
  return (
    <LinearGradient colors={['#84bfdd', '#fff7cf']} style={styles.container}>
      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate('EditProfile')}>
        <Text style={styles.optionText}>Edit Profile Info</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate('ChangeEmail')}>
        <Text style={styles.optionText}>Change Email</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate('NotificationSettings')}>
        <Text style={styles.optionText}>Notification Settings</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f0f4f8',
  },
  option: {
    paddingVertical: 20,
    paddingHorizontal: 30,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  optionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',

  },
});