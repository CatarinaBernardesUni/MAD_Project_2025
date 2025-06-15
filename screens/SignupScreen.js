import React, { useState } from 'react';
import {
  View, Text, TextInput, Alert, Pressable, StyleSheet,
  TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

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
      Alert.alert('Success', 'Your account has been successfully created!');
    } catch (err) {
      Alert.alert(
      'Sign Up Failed', 'An unexpected error occurred while creating your account. Please try again.'
    );
    }
  };

  const roles = ['student', 'teacher'];

  return (
    <LinearGradient colors={['#84bfdd','#fff7cf']} style={styles.container}>
      <KeyboardAvoidingView keyboardVerticalOffset={60} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Sign Up</Text>

          <View style={styles.inputContainer}>
            <Icon name="account-outline" size={20} color="#000000" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#000000"
              onChangeText={(name) => setForm({ ...form, name })}
              value={form.name}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="calendar" size={20} color="#000000" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Age"
              placeholderTextColor="#000000"
              keyboardType="numeric"
              onChangeText={(age) => setForm({ ...form, age })}
              value={form.age}
            />
          </View>

          <Text style={styles.label}>Role:</Text>
          <View style={styles.radioGroup}>
            {roles.map((role) => (
              <Pressable
                key={role}
                style={[styles.radioButton, form.role === role && styles.radioButtonSelected]}
                onPress={() => setForm({ ...form, role })}
              >
                <Text style={styles.radioText}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.inputContainer}>
            <Icon name="email-outline" size={20} color="#000000" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#000000"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(email) => setForm({ ...form, email })}
              value={form.email}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock-outline" size={20} color="#000000" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#000000"
              secureTextEntry
              autoCapitalize="none"
              onChangeText={(password) => setForm({ ...form, password })}
              value={form.password}
            />
          </View>

          <TouchableOpacity
            style={[styles.imagePicker, { backgroundColor: 'rgba(255, 255, 255, 0.6)' }]}
            onPress={async () => {
              const uri = await pickImage();
              if (uri) {
                setForm((prev) => ({ ...prev, profilePicture: uri }));
              }
            }}
          >
            <Text style={{ color: '#000000' }}>
              {form.profilePicture ? 'Change Profile Picture' : 'Add Profile Picture (Optional)'}
            </Text>
          </TouchableOpacity>

          {form.profilePicture && <Image source={{ uri: form.profilePicture }} style={styles.previewImage} />}

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 150,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
    width: '100%',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#000000',
    fontSize: 16,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '500',
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    width: '100%',
  },
  radioButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#aaa',
    backgroundColor: 'rgba(98, 118, 163, 0.61)',
  },
  radioButtonSelected: {
    backgroundColor: '#477fd1',
    borderColor: '#477fd1',
    shadowColor: '#477fd1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 6,
  },
  radioText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  imagePicker: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginBottom: 10,
    alignItems: 'center',
    width: '100%',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 15,
  },
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
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
});