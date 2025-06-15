import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, Image, ScrollView, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadImage, pickImage } from '../../utils/uploadImage';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
        Alert.alert(
          'Oops!',
          'We had trouble loading the teacher information. Please try again later.',
        );
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
        Alert.alert(
          'Oops!',
          'We couldn’t fetch the subjects right now. Please check your internet connection and try again.',
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

  const handleUpdateTeacher = async () => {
    if (!form.name || !form.age) {
      Alert.alert(
        'Missing Information',
        'Please make sure you fill out all the required fields: Name and Age.',
        [{ text: 'Got it' }]
      );
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
        profilePicture: finalImageUrl || null,
      });
      Alert.alert(
        'Success!',
        'The teacher’s information has been successfully updated.',
      );
      navigation.goBack();
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
          <Text style={styles.title}>Edit Teacher</Text>

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

          <Text style={styles.label}>Subjects:</Text>
          <View style={styles.radioGroup}>
            {availableSubjects.map(subject => (
              <TouchableOpacity
                key={subject}
                style={[styles.radioButton, form.subjects.includes(subject) && styles.radioButtonSelected]}
                onPress={() => toggleSubject(subject)}
              >
                <Text style={styles.radioText}>{subject}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.imagePicker, { backgroundColor: 'rgba(255, 255, 255, 0.6)' }]}
            onPress={async () => {
              const uri = await pickImage();
              if (uri) {
                setForm(prev => ({ ...prev, profilePicture: uri }));
                setPictureChanged(true);
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

          <TouchableOpacity style={styles.button} onPress={handleUpdateTeacher}>
            <Text style={styles.buttonText}>Update Teacher</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
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
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  radioButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#aaa',
    backgroundColor: 'rgba(98, 118, 163, 0.61)',
    margin: 4,
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
