import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ManageStudents = () => {
  return (
    <View style={styles.container}>
        <Text style={styles.title}>Manage Students</Text>
        <Text style={styles.text}>This is where you will add, edit, or delete student profiles.</Text>
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
});

export default ManageStudents;