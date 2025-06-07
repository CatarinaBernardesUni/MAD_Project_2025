import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const EditClass = ({ route, navigation }) => {
  const { classData } = route.params;
  const [loading, setLoading] = useState(false);

  // Editable fields
  const [subject, setSubject] = useState(classData.subjectId || '');
  const [professor, setProfessor] = useState(classData.professorId || '');
  const [classType, setClassType] = useState(classData.classType || '');
  const [date, setDate] = useState(classData.start ? classData.start.toISOString().slice(0, 10) : '');

  // Dropdown options
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [professorOptions, setProfessorOptions] = useState([]);
  const [classTypeOptions, setClassTypeOptions] = useState([]);

  useEffect(() => {
    // Fetch dropdown options
    const fetchDropdowns = async () => {
      const subjectsSnap = await getDocs(collection(db, 'subjects'));
      setSubjectOptions(subjectsSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name || doc.id })));

      const usersSnap = await getDocs(collection(db, 'users'));
      setProfessorOptions(usersSnap.docs
        .filter(doc => (doc.data().roles || []).includes('teacher'))
        .map(doc => ({ id: doc.id, name: doc.data().name || doc.data().fullName || doc.id }))
      );

      const classTypesSnap = await getDocs(collection(db, 'classType'));
      setClassTypeOptions(classTypesSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name || doc.id })));
    };
    fetchDropdowns();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'classes', classData.id), {
        subject: `subjects/${subject}`,
        professor: `users/${professor}`,
        classType: classType,
        // Add other fields as needed
        start: new Date(date),
      });
      Alert.alert('Success', 'Class updated!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Class</Text>

      <Text style={styles.label}>Subject</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={subject} onValueChange={setSubject} style={styles.picker}>
          {subjectOptions.map(opt => (
            <Picker.Item key={opt.id} label={opt.name} value={opt.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Teacher</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={professor} onValueChange={setProfessor} style={styles.picker}>
          {professorOptions.map(opt => (
            <Picker.Item key={opt.id} label={opt.name} value={opt.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Class Type</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={classType} onValueChange={setClassType} style={styles.picker}>
          {classTypeOptions.map(opt => (
            <Picker.Item key={opt.id} label={opt.name} value={opt.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F6FC', padding: 20 },
  title: { fontSize: 24, color: '#4A90E2', fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, color: '#444', marginBottom: 4, marginTop: 12 },
  input: { borderColor: '#ccc', borderWidth: 1, padding: 8, borderRadius: 6, backgroundColor: '#fff', marginBottom: 8 },
  pickerWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, backgroundColor: '#fff' },
  picker: { height: 100, width: '100%' },
  saveButton: { backgroundColor: '#4A90E2', padding: 12, borderRadius: 6, marginTop: 16, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default EditClass;