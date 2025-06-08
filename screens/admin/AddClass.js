import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const AddClass = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [subjects, setSubjects] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [classType, setClassType] = useState([]);
  const [form, setForm] = useState({
    subjectId: '',
    professorId: '',
    classType: '',
    date: '',
    startTime: '',
    endTime: '',
    additionalNotes: '',
    peopleLimit: '',
  });
  const [loading, setLoading] = useState(false);

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      const subjSnap = await getDocs(collection(db, 'subjects'));
      const profSnap = await getDocs(collection(db, 'users'));

      const fetchedSubjects = subjSnap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));

      const teacherUsers = profSnap.docs
        .filter(doc => {
          const roles = doc.data().roles || [];
          return Array.isArray(roles) && roles.includes('teacher');
        })
        .map(doc => ({
          id: doc.id,
          name: doc.data().name || doc.data().fullName || 'Unnamed',
          subjects: doc.data().subjects || [],
        }));

      setSubjects(fetchedSubjects);
      setProfessors(teacherUsers);
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  };

  // Fetch class types
  useEffect(() => {
    const fetchClassType = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'classType'));
        const types = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClassType(types);
      } catch (error) {
        console.error('Error fetching class types:', error);
      }
    };
    fetchClassType();
  }, []);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Filter professors by subject
  useEffect(() => {
    if (!form.subjectId) {
      setFilteredProfessors([]);
      return;
    }
    const selectedSubj = subjects.find(s => s.id === form.subjectId)?.name;
    const filtered = professors.filter(p =>
      p.subjects.includes(selectedSubj)
    );
    setFilteredProfessors(filtered);
    setForm(f => ({ ...f, professorId: '' }));
  }, [form.subjectId, subjects, professors]);

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleAddClass = async () => {
    const startDateTime = new Date(`${form.date}T${form.startTime}:00`);
    const endDateTime = new Date(`${form.date}T${form.endTime}:00`);

    if (
      !form.subjectId ||
      !form.professorId ||
      !form.classType ||
      !form.date ||
      !form.startTime ||
      !form.endTime ||
      isNaN(startDateTime.getTime()) ||
      isNaN(endDateTime.getTime())
    ) {
      alert('Please fill in all required fields with valid data');
      return;
    }

    if (endDateTime <= startDateTime) {
      alert('End time must be after start time.');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'classes'), {
        subject: `subjects/${form.subjectId}`,
        professor: `users/${form.professorId}`,
        classType: form.classType,
        start: Timestamp.fromDate(startDateTime),
        end: Timestamp.fromDate(endDateTime),
        additionalNotes: form.additionalNotes || '',
        peopleLimit: form.peopleLimit === '' ? null : Number(form.peopleLimit),
        description: '',
      });
      alert('Class added successfully');
      navigation.goBack();
    } catch (err) {
      console.error('Error adding class:', err);
      alert('Failed to add class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Class</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.goBack()}
          >
            <Text>Back</Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          <Text style={styles.label}>Subject:</Text>
          {subjects.map(subj => (
            <TouchableOpacity
              key={subj.id}
              onPress={() => handleChange('subjectId', subj.id)}
              style={[
                styles.option,
                form.subjectId === subj.id && styles.selected,
              ]}
            >
              <Text>{subj.name}</Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.label}>Teacher:</Text>
          {filteredProfessors.length > 0 ? (
            filteredProfessors.map(prof => (
              <TouchableOpacity
                key={prof.id}
                onPress={() => handleChange('professorId', prof.id)}
                style={[
                  styles.option,
                  form.professorId === prof.id && styles.selected,
                ]}
              >
                <Text>{prof.name}</Text>
              </TouchableOpacity>
            ))
          ) : form.subjectId ? (
            <Text style={{ fontStyle: 'italic' }}>No teachers for this subject</Text>
          ) : null}

          <Text style={styles.label}>Class Type:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={form.classType}
              onValueChange={v => handleChange('classType', v)}
              style={styles.picker}
            >
              <Picker.Item label="Select Class Type" value="" />
              {classType.map(type => (
                <Picker.Item key={type.id} label={type.name} value={type.name} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Date:</Text>
          <TextInput
            value={form.date}
            onChangeText={v => handleChange('date', v)}
            style={styles.input}
            placeholder="e.g. 2025-06-12"
          />
          <Text style={styles.label}>Start Time:</Text>
          <TextInput
            value={form.startTime}
            onChangeText={v => handleChange('startTime', v)}
            style={styles.input}
            placeholder="e.g. 14:30"
          />

          <Text style={styles.label}>End Time:</Text>
          <TextInput
            value={form.endTime}
            onChangeText={v => handleChange('endTime', v)}
            style={styles.input}
            placeholder="e.g. 16:00"
          />

          <Text style={styles.label}>Additional Notes:</Text>
          <TextInput
            value={form.additionalNotes}
            onChangeText={v => handleChange('additionalNotes', v)}
            style={styles.input}
            placeholder="Optional notes..."
          />

          <Text style={styles.label}>People Limit (optional):</Text>
          <TextInput
            value={form.peopleLimit}
            onChangeText={v => handleChange('peopleLimit', v)}
            keyboardType="numeric"
            style={styles.input}
            placeholder="e.g. 20"
          />

          <TouchableOpacity
            style={styles.addButton2}
            onPress={handleAddClass}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text style={{ color: '#fff' }}>Add Class</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {fontSize: 24, fontWeight: 'bold', marginBottom: 12},
  title: { fontSize: 22, fontWeight: 'bold' },
  addButton: { backgroundColor: '#cde', padding: 8, borderRadius: 6, alignSelf: 'flex-end', marginBottom: 12 },
  label: { fontWeight: 'bold', marginTop: 12 },
  input: {borderColor: '#ccc', borderWidth: 1, padding: 8, marginBottom: 12, borderRadius: 6},
  option: {padding: 10, backgroundColor: '#eee', borderRadius: 6, marginVertical: 4, borderColor: '#ccc', borderWidth: 1},
  selected: {backgroundColor: '#D0E6FF',},
  addButton2: {backgroundColor: '#4A90E2', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 20},
  pickerWrapper: {borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 12,
   height: 50, justifyContent: 'center',marginTop: 12},
  picker: { height: 56, width: '100%' },
});

export default AddClass;