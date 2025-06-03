import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function SignupScreen() {
  const [form, setForm] = useState({
    name: '', age: '', email: '', password: '', role: ''
  });

  const handleSignUp = async () => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, 'users', user.uid), {
        name: form.name,
        age: parseInt(form.age),
        email: form.email,
        roles: [form.role],
      });
      Alert.alert('Account created!');
    } catch (err) {
      Alert.alert('Error:', err.message);
    }
  };

  return (
    <View>
      <Text>Sign Up</Text>
      <TextInput placeholder="Name" onChangeText={name => setForm({ ...form, name })} />
      <TextInput placeholder="Age" keyboardType="numeric" onChangeText={age => setForm({ ...form, age })} />
      <View>
        <Text>Role:</Text>
        <Button title="Student" onPress={() => setForm({ ...form, role: 'student' })} />
        <Button title="Teacher" onPress={() => setForm({ ...form, role: 'teacher' })} />
      </View>
      <TextInput placeholder="Email" onChangeText={email => setForm({ ...form, email })} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={password => setForm({ ...form, password })} />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
}
