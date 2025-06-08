import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, Alert, TouchableOpacity, Image, ScrollView, StyleSheet
} from 'react-native';
import { doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { uploadImage, pickImage } from '../../utils/uploadImage';

export default function EditTeacherScreen({ route, navigation }) {
  const { teacherId } = route.params;
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pictureChanged, setPictureChanged] = useState(false);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'users', teacherId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            name: data.name || '',
            age: data.age?.toString() || '',
            email: data.email || '',
            profilePicture: data.profilePicture || null,
            subjects: data.subjects || [],
          });
        }
        setLoading(false);
      } catch (err) {
        Alert.alert('Error loading teacher');
      }
    };

    fetchTeacher();
  }, [teacherId]);

  const [availableSubjects, setAvailableSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'subjects'));
        const subjectNames = snapshot.docs.map(doc => doc.data().name);
        setAvailableSubjects(subjectNames);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        Alert.alert('Error fetching subjects');
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

  const handleUpdateTeacher = async () => {
    if (!form.name || !form.age || !form.email) {
      Alert.alert('All fields except picture are required.');
      return;
    }

    try {
      const teacherRef = doc(db, 'users', teacherId);
      let finalImageUrl = form.profilePicture;

      if (pictureChanged && form.profilePicture) {
      finalImageUrl = await uploadImage(form.profilePicture, teacherId);
    }

      await updateDoc(teacherRef, {
        name: form.name,
        age: parseInt(form.age),
        email: form.email,
        subjects: form.subjects,
        profilePicture: finalImageUrl  || null,
      });
      Alert.alert('Teacher updated!');
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
      <Text style={styles.title}>Edit Teacher</Text>

      <TextInput style={styles.input} placeholder="Name" value={form.name} onChangeText={name => setForm({ ...form, name })} />
      <TextInput style={styles.input} placeholder="Age" keyboardType="numeric" value={form.age} onChangeText={age => setForm({ ...form, age })} />
      <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={email => setForm({ ...form, email })} autoCapitalize="none" editable={false} />

      <Text style={styles.label}>Subjects:</Text>
      <View style={styles.subjectContainer}>
        {availableSubjects.map(subject => (
          <TouchableOpacity
            key={subject}
            style={[
              styles.subjectButton,
              form.subjects.includes(subject) && styles.subjectSelected
            ]}
            onPress={() => toggleSubject(subject)}
          >
            <Text>{subject}</Text>
          </TouchableOpacity>
        ))}
      </View>

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

      <Button title="Update Teacher" onPress={handleUpdateTeacher} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
  label: { marginBottom: 6, fontWeight: '600' },
  subjectContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, gap: 8 },
  subjectButton: { padding: 10, backgroundColor: '#eee', borderRadius: 6 },
  subjectSelected: { backgroundColor: '#aaf' },
  imagePicker: { padding: 10, backgroundColor: '#ccc', borderRadius: 6, marginBottom: 10, alignItems: 'center' },
  previewImage: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 10 },
});
