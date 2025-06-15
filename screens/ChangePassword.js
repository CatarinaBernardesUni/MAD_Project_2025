import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

export default function ResetPassword({ navigation }) {
  const user = auth.currentUser;

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert('Success!', 'Password reset email sent to your email address.');
      navigation.goBack();
    } catch (error) {
      Alert.alert(
      'Password Reset Failed', 'Something went wrong while trying to send the password reset email. Please try again later.'
    );
    }
  };

  return (
    <LinearGradient colors={['#84bfdd', '#fff7cf']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reset Your Password</Text>

        <View style={styles.whiteBox}>
          <Text style={styles.infoText}>
            We will send a password reset email to:
          </Text>
          <Text style={styles.emailText}>{user.email}</Text>
        

        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Send Reset Email</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginTop: 20 }}>
          <Text style={{ color: '#000000', textDecorationLine: 'underline' }}>Back to Settings</Text>
        </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  whiteBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  infoText: {
    color: '#000', // Black text
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  emailText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#5996b5',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    width: '100%',
    marginTop:20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
});
