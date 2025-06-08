import React, { useState } from 'react';
import {
  View, Text, TextInput, Alert, Pressable, StyleSheet,
  TouchableOpacity, ScrollView, Image
} from 'react-native';

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

import { uploadImage, pickImage } from '../utils/uploadImage';

export default function SignupScreen() {
  const [form, setForm] = useState({
    name: '', age: '', email: '', password: '', role: '', profilePicture: null
  });

  const handleSignUp = async () => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      let downloadURL = null;

      if (form.profilePicture) {
        downloadURL = await uploadImage(form.profilePicture, user.uid);
      }

      await updateProfile(user, {
        displayName: form.name,
        photoURL: downloadURL,
      });

      await setDoc(doc(db, 'users', user.uid), {
        name: form.name,
        age: parseInt(form.age),
        email: form.email,
        roles: [form.role],
        profilePicture: downloadURL || null,
      });
      Alert.alert('Account created!');
    } catch (err) {
      Alert.alert('Error:', err.message);
    }
  };

  const roles = ['student', 'teacher'];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        onChangeText={name => setForm({ ...form, name })}
        value={form.name}
      />

      <TextInput
        style={styles.input}
        placeholder="Age"
        keyboardType="numeric"
        onChangeText={age => setForm({ ...form, age })}
        value={form.age}
      />

      <Text style={styles.label}>Role:</Text>
      <View style={styles.radioGroup}>
        {roles.map(role => (
          <Pressable
            key={role}
            style={[
              styles.radioButton,
              form.role === role && styles.radioButtonSelected
            ]}
            onPress={() => setForm({ ...form, role })}
          >
            <Text style={styles.radioText}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={email => setForm({ ...form, email })}
        value={form.email}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        autoCapitalize="none"
        onChangeText={password => setForm({ ...form, password })}
        value={form.password}
      />

      <TouchableOpacity style={styles.imagePicker} onPress={async () => {
        const uri = await pickImage();
        if (uri) {
          setForm(prev => ({ ...prev, profilePicture: uri }));
        }
      }}>
        <Text style={styles.imagePickerText}>
          {form.profilePicture ? 'Change Profile Picture' : 'Add Profile Picture (Optional)'}
        </Text>
      </TouchableOpacity>

      {form.profilePicture && (
        <Image
          source={{ uri: form.profilePicture }}
          style={styles.previewImage}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '500',
    color: '#444',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  radioButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#999',
    backgroundColor: '#eee',
  },
  radioButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  radioText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  imagePicker: {
    backgroundColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerText: {
    fontSize: 16,
    color: '#555',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
