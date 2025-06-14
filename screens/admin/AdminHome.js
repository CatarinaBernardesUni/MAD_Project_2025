import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView  } from 'react-native';

import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

const AdminHome = ({ navigation }) => {

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>TimeToTeach</Text>
      <Text style={styles.welcome}>Welcome, Admin!{'\n'}What would you like to manage today?</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ManageClasses')}>
        <Text style={styles.buttonText}>Manage Classes</Text>
        <Text style={styles.subtext}>Add, edit or delete class sessions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ManageTeachers')}>
        <Text style={styles.buttonText}>Manage Teachers</Text>
        <Text style={styles.subtext}>Add, edit or delete teacher profiles</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ManageStudents')}>
        <Text style={styles.buttonText}>Manage Students</Text>
        <Text style={styles.subtext}>Add, edit or delete student profiles</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ManageSubjects')}>
        <Text style={styles.buttonText}>Manage Subjects</Text>
        <Text style={styles.subtext}>Add, edit or delete the subjects in the app</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ManageClassType')}>
        <Text style={styles.buttonText}>Manage Class Types</Text> 
        <Text style={styles.subtext}>Add, edit or delete class types</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EnrollStudents')}>
        <Text style={styles.buttonText}>Enroll Students</Text>
        <Text style={styles.subtext}>Assign existing students to classes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Dashboard')}>
        <Text style={styles.buttonText}>Dashboard</Text>
        <Text style={styles.subtext}>Overview of attendance and records</Text>
      </TouchableOpacity>
      </ScrollView>

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
    backgroundColor: '#F7F9FC',
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'flex-start',
    marginBottom: 10,
    marginLeft: 8,
  },
  welcome: {
    fontSize: 16,
    textAlign: 'flex-start',
    color: '#555',
    marginBottom: 20,
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#E1ECF7',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#B0C4DE',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1B365C',
  },
  subtext: {
    fontSize: 12,
    color: '#555',
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: 40,
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
  menuButton: {
    marginRight: 15,
  },
  menuIcon: {
    fontSize: 28,
    color: '#fff',
  },
});

export default AdminHome;
