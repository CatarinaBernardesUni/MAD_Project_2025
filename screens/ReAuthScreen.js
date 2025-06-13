import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { auth } from '../firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, sendEmailVerification, verifyBeforeUpdateEmail  } from 'firebase/auth';

export default function ReAuthScreen({ route, navigation }) {
  const { newEmail } = route.params;

  if (!newEmail) {
    Alert.alert('No new email provided.');
    navigation.goBack();
    return null;
  }

  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReAuth = async () => {
  setLoading(true);
  try {
    const user = auth.currentUser;

    if (!user) throw new Error('User not authenticated');

    // Step 1: Reauthenticate
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    console.log('Reauthentication successful');

    // Step 2: Send verification and pending email update
    await verifyBeforeUpdateEmail(user, newEmail);
    console.log('Verification email sent to:', newEmail);

    Alert.alert(
      'Verify Your New Email',
      'A verification link has been sent to your new email address. Please verify it to complete the update.'
    );

    // Optional: Go back
    navigation.goBack();

  } catch (error) {
    console.error('ReAuth Error:', error);
    Alert.alert('Error!', error.message);
  } finally {
    setLoading(false);
  }
};



  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>
          Please reauthenticate first
        </Text>

        <View style={styles.inputContainer}>
          {/* Optional icon here if you wish */}
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder='Current Password'
            value={currentPassword}
            onChangeText={(setCurrentPassword)}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          disabled={loading}
          onPress={handleReAuth}>
          <Text style={styles.buttonText}>
            {loading ? "Reauthenticating…" : "Reauthenticate"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: { flex: 1 },
  innerContainer: { 
    flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  title: { 
    fontSize: 42, fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center' },
  inputContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    borderRadius: 25, 
    paddingHorizontal: 15,
    marginBottom: 20,
    width: '100%' },
  input: { 
    flex: 1, paddingVertical: 12, color: '#000000', fontSize: 16 },
  button: {
    backgroundColor: '#5996b5',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18, textAlign: 'center' },
});
