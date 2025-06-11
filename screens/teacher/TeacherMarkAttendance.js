import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TeacherMarkAttendance = () => {
  return (
    <View style={styles.container}>
        <Text style={styles.title}>Teacher Mark Attendance</Text>
        <Text style={styles.text}>Hi.</Text>

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

export default TeacherMarkAttendance;