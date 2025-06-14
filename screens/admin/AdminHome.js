import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert  } from 'react-native';

import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { LinearGradient } from 'expo-linear-gradient';

const AdminHome = ({ navigation }) => {
  const handleLogout = () => {
    Alert.alert(
        'Confirm Logout',
        'Are you sure you want to log out?',
        [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: confirmLogout }
        ]
    );
};

const confirmLogout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        Alert.alert('Error', 'Could not log out. Please try again.');
    }
};

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

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'flex-start',
        marginBottom: 10,
        marginLeft: 8,
    },
    welcome: {
        fontSize: 16,
        textAlign: 'flex-start',
        color: '#333',
        marginBottom: 20,
        marginLeft: 8,
    },
    button: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 15,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#5996b5',
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#023E8A',
    },
    subtext: {
        fontSize: 14,
        color: '#555',
    },
    logoutButton: {
        marginTop: 10,
        marginBottom: 60,
        alignSelf: 'center',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 30,
        backgroundColor: '#FF6B6B',
    },
    logoutText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default AdminHome;
