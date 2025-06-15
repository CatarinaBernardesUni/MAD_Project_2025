import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Settings({ navigation }) {
  return (
    <LinearGradient colors={['#84bfdd', '#fff7cf']} style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate('EditProfile')}
        activeOpacity={0.7}
      >
        <Text style={styles.optionText}>Edit Profile Info</Text>
        <Icon name="chevron-right" size={24} color="#333" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate('ChangeEmail')}
        activeOpacity={0.7}
      >
        <Text style={styles.optionText}>Change Email</Text>
        <Icon name="chevron-right" size={24} color="#333" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate('ChangePassword')}
        activeOpacity={0.7}
      >
        <Text style={styles.optionText}>Reset Password</Text>
        <Icon name="chevron-right" size={24} color="#333" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
});