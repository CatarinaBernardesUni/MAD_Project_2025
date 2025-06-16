import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, Image, ScrollView, StyleSheet, KeyboardAvoidingView, Pressable } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, collection, getDocs } from 'firebase/firestore';
import { db, secondaryAuth } from '../../firebase';
import { uploadImage, pickImage } from '../../utils/uploadImage';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

export default function AddTeacherScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    profilePicture: null,
    subjects: [],
  });

  const [availableSubjects, setAvailableSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'subjects'));
        const subjectNames = snapshot.docs.map(doc => doc.data().name);
        setAvailableSubjects(subjectNames);
      } catch (error) {
        Alert.alert(
          'Unable to Load Subjects',
          'There was a problem fetching the list of subjects. Please check your internet connection and try again later.'
        );
      }
    };

    fetchSubjects();
  }, []);

  const toggleSubject = (subject) => {
    const newSubjects = form.subjects.includes(subject)
      ? form.subjects.filter(s => s !== subject)
      : [...form.subjects, subject];
    setForm({ ...form, subjects: newSubjects });
  };

  const handleAddTeacher = async () => {
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
        roles: ['teacher'],
        subjects: form.subjects,
        profilePicture: downloadURL || null,
      });
      Alert.alert('Success', 'Teacher account has been successfully created.');
      navigation.navigate('ManageTeachers');
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
          message = 'Could not create teacher account. Please try again.';
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
          <Text style={styles.title}>Add New Teacher</Text>

          <View style={styles.inputContainer}>
            <Icon name="account-outline" size={20} color="#000000" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#000000"
              value={form.name}
              onChangeText={name => setForm({ ...form, name })}
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
              onChangeText={age => setForm({ ...form, age })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="email-outline" size={20} color="#000000" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#000000"
              keyboardType="email-address"
              value={form.email}
              onChangeText={email => setForm({ ...form, email })}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock-outline" size={20} color="#000000" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#000000"
              secureTextEntry
              value={form.password}
              onChangeText={password => setForm({ ...form, password })}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Subjects:</Text>
          <View style={styles.subjectContainer}>
            {availableSubjects.map(subject => (
              <Pressable
                key={subject}
                style={[
                  styles.subjectButton,
                  form.subjects.includes(subject) && styles.subjectSelected
                ]}
                onPress={() => toggleSubject(subject)}
              >
                <Text style={styles.subjectText}>{subject}</Text>
              </Pressable>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.imagePicker, { backgroundColor: 'rgba(255, 255, 255, 0.6)' }]}
            onPress={async () => {
              const uri = await pickImage();
              if (uri) {
                setForm(prev => ({ ...prev, profilePicture: uri }));
              }
            }}
          >
            <Text style={{ color: '#000000' }}>
              {form.profilePicture ? 'Change Profile Picture' : 'Add Profile Picture (Optional)'}
            </Text>
          </TouchableOpacity>

          {form.profilePicture && (
            <Image source={{ uri: form.profilePicture }} style={styles.previewImage} />
          )}

          <TouchableOpacity style={styles.button} onPress={handleAddTeacher}>
            <Text style={styles.buttonText}>Add Teacher</Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    justifyContent: 'center',
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
  subjectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 10,
    justifyContent: 'center',
  },
  subjectButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#aaa',
    backgroundColor: 'rgba(98, 118, 163, 0.61)',
  },
  subjectSelected: {
    backgroundColor: '#477fd1',
    borderColor: '#477fd1',
    shadowColor: '#477fd1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 6,
  },
  subjectText: {
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
