import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

const StudentHome = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Home</Text>
      <Text style={styles.text}>This is your student home.</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={async () => {
        try {
          console.log('Logged in UID:', auth.currentUser.uid);
          await signOut(auth);
          console.log('Signed out successfully');
        } catch (error) {
          console.error('Error signing out:', error);
        }
      }}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F6FC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#4A90E2',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 30,
    alignSelf: 'center',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: '#FF6B6B',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StudentHome;