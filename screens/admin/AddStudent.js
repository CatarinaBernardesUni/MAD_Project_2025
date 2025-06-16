import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, Image, ScrollView, StyleSheet, KeyboardAvoidingView} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { db, secondaryAuth } from '../../firebase';
import { uploadImage, pickImage } from '../../utils/uploadImage';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';


export default function AddStudent({ navigation }) {
    const [form, setForm] = useState({
        name: '',
        age: '',
        email: '',
        password: '',
        profilePicture: null,
    });

    const handleAddStudent = async () => {
        if (!form.email || !form.password || !form.name || !form.age) {
            Alert.alert('Missing Information', 'Please complete all fields before submitting.');
            return;
        }

        try {
            const { user } = await createUserWithEmailAndPassword(secondaryAuth, form.email, form.password);

            let downloadURL = null;
            if (form.profilePicture) {
                downloadURL = await uploadImage(form.profilePicture, user.uid);
            }

            await setDoc(doc(db, 'users', user.uid), {
                name: form.name,
                age: parseInt(form.age),
                email: form.email,
                roles: ['student'],
                profilePicture: downloadURL || null,
            });
            Alert.alert('Success', 'Student account has been successfully created.');
            navigation.navigate('ManageStudents');
        } catch (err) {
            let message = 'Something went wrong. Please try again later.';

            switch (err.code) {
                case 'auth/email-already-in-use':
                    message = 'This email is already in use. Please use a different email.';
                    break;
                case 'auth/invalid-email':
                    message = 'The email address is not valid. Please check and try again.';
                    break;
                case 'auth/weak-password':
                    message = 'The password is too weak. Please use at least 6 characters.';
                    break;
                default:
                    message = 'Could not create student account. Please try again.';
            }

            Alert.alert('Error', message);
        } finally {
            await secondaryAuth.signOut();
        }
    };

    return (
        <LinearGradient colors={['#84bfdd', '#fff7cf']} style={styles.container}>
      <KeyboardAvoidingView keyboardVerticalOffset={60} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Add New Student</Text>

          <View style={styles.inputContainer}>
            <Icon name="account-outline" size={20} color="#000000" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#000000"
              value={form.name}
              onChangeText={(name) => setForm({ ...form, name })}
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
              value={form.age}
              onChangeText={(age) => setForm({ ...form, age })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="email-outline" size={20} color="#000000" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#000000"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(email) => setForm({ ...form, email })}
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
              value={form.password}
              onChangeText={(password) => setForm({ ...form, password })}
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

          <TouchableOpacity style={styles.button} onPress={handleAddStudent}>
            <Text style={styles.buttonText}>Add Student</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, color: '#000000', fontSize: 16 },
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
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18, textAlign: 'center' },
});