import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';

import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Now check if user exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Sign out and show alert
      await signOut(auth);
      Alert.alert(
        'Account Deleted',
        'Your account has been removed from the system. Please contact an administrator.'
      );
      return;
    }

    // If Firestore user document exists
    console.log('Login successful');
    Alert.alert('Login Successful', 'You have successfully logged in.');

  } catch (err) {
    Alert.alert('Login Failed', err.message);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        autoCapitalize="none"
        onChangeText={setPassword}
        value={password}
      />
      <Button title="Log In" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flex: 1, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 16, borderRadius: 6 },
});