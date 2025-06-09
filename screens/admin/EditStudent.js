import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, Alert, TouchableOpacity, Image, ScrollView, StyleSheet
} from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore'; // removed collection, getDocs
import { db } from '../../firebase';
import { uploadImage, pickImage } from '../../utils/uploadImage';

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
        Alert.alert('Error loading student');
      }
    };

    fetchStudent();
  }, [studentId]);

  const handleUpdateStudent = async () => {
    if (!form.name || !form.age || !form.email) {
      Alert.alert('All fields except picture are required.');
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
        profilePicture: finalImageUrl  || null,
      });
      Alert.alert('Student updated!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error:', err.message);
    }
  };

  if (loading || !form) {
    return <Text style={{ padding: 20 }}>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Student</Text>

      <TextInput style={styles.input} placeholder="Name" value={form.name} onChangeText={name => setForm({ ...form, name })} />
      <TextInput style={styles.input} placeholder="Age" keyboardType="numeric" value={form.age} onChangeText={age => setForm({ ...form, age })} />
      <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={email => setForm({ ...form, email })} autoCapitalize="none" editable={false} />
      <TouchableOpacity style={styles.imagePicker} onPress={async () => {
        const uri = await pickImage();
        if (uri) {
          setForm(prev => ({ ...prev, profilePicture: uri }));
          setPictureChanged(true);
        }
      }}>
        <Text>{form.profilePicture ? 'Change Profile Picture' : 'Add Profile Picture (Optional)'}</Text>
      </TouchableOpacity>

      {form.profilePicture && (
        <Image source={{ uri: form.profilePicture }} style={styles.previewImage} />
      )}
        <Button title="Update Student" onPress={handleUpdateStudent} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
  label: { marginBottom: 6, fontWeight: '600' },
  imagePicker: { padding: 10, backgroundColor: '#ccc', borderRadius: 6, marginBottom: 4, alignItems: 'center' },
  previewImage: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 4 },
});