import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, Image, ScrollView, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadImage, pickImage } from '../../utils/uploadImage';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

export default function EditStudent({ route, navigation }) {
  const { studentId } = route.params;
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pictureChanged, setPictureChanged] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'users', studentId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            name: data.name || '',
            age: data.age?.toString() || '',
            email: data.email || '',
            profilePicture: data.profilePicture || null,
          });
        }
        setLoading(false);
      } catch (err) {
        Alert.alert(
          'Oops!',
          'We had trouble loading the student information. Please try again later.',
        );
      }
    };

    fetchStudent();
  }, [studentId]);

  const handleUpdateStudent = async () => {
    if (!form.name || !form.age) {
      Alert.alert(
        'Missing Information',
        'Please make sure you fill out all the required fields: Name and Age.',
        [{ text: 'Got it' }]
      );
      return;
    }

    try {
      const studentRef = doc(db, 'users', studentId);
      let finalImageUrl = form.profilePicture;

      if (pictureChanged && form.profilePicture) {
        finalImageUrl = await uploadImage(form.profilePicture, studentId);
      }

      await updateDoc(studentRef, {
        name: form.name,
        age: parseInt(form.age),
        email: form.email,
        profilePicture: finalImageUrl || null,
      });
      Alert.alert(
        'Success!',
        'The student’s information has been successfully updated.',
      );
      navigation.navigate('ManageStudents');
    } catch (err) {
      Alert.alert(
        'Update Failed',
        'Something went wrong while updating the student. Please try again.',
      );
    }
  };

  if (loading || !form) {
    return <Text style={{ padding: 20 }}>Loading...</Text>;
  }

  return (
    <LinearGradient colors={['#84bfdd', '#fff7cf']} style={styles.container}>
      <KeyboardAvoidingView keyboardVerticalOffset={60} style={styles.container} behavior='height'>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Edit Student</Text>

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
              style={[styles.input, { color: '#a0a0a0' }]}
              placeholder="Email"
              placeholderTextColor="#000000"
              value={form.email}
              editable={false}
            />
          </View>

          <TouchableOpacity style={[styles.imagePicker, { backgroundColor: 'rgba(255, 255, 255, 0.6)' }]} onPress={async () => {
            const uri = await pickImage();
            if (uri) {
              setForm(prev => ({ ...prev, profilePicture: uri }));
              setPictureChanged(true);
            }
          }}>
            <Text style={{ color: '#000000' }}>
              {form.profilePicture ? 'Change Profile Picture' : 'Add Profile Picture (Optional)'}
            </Text>
          </TouchableOpacity>

          {form.profilePicture && (
            <Image source={{ uri: form.profilePicture }} style={styles.previewImage} />
          )}

          <TouchableOpacity style={styles.button} onPress={handleUpdateStudent}>
            <Text style={styles.buttonText}>Update Student</Text>
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