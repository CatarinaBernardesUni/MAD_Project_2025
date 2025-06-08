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
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedProfessor, setSelectedProfessor] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [peopleLimit, setPeopleLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const [classType, setClassType] = useState([]);
  const [selectedClassType, setSelectedClassType] = useState('');

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

  const handleSubjectSelect = subjectId => {
    setSelectedSubject(subjectId);
    const selectedSubj = subjects.find(s => s.id === subjectId)?.name;
    const filtered = professors.filter(p =>
      p.subjects.includes(selectedSubj)
    );
    setFilteredProfessors(filtered);
    setSelectedProfessor('');
  };

  const parseDate = str => {
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const handleAddClass = async () => {
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    if (
      !selectedSubject ||
      !selectedProfessor ||
      !selectedClassType ||
      !date ||
      !startTime ||
      !endTime ||
      isNaN(startDateTime.getTime()) ||
      isNaN(endDateTime.getTime())
    ) {
      alert('Please fill in all required fields with valid data');
      return;
    }

    // Validation: End time must be after start time (on the same date)
    if (endDateTime <= startDateTime) {
      alert('End time must be after start time.');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'classes'), {
        subject: `subjects/${selectedSubject}`,
        professor: `users/${selectedProfessor}`,
        classType: selectedClassType,
        start: Timestamp.fromDate(startDateTime),
        end: Timestamp.fromDate(endDateTime),
        additionalNotes: additionalNotes || '', // Optional
        peopleLimit: peopleLimit === '' ? null : Number(peopleLimit), // Optional
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

  useEffect(() => {
    const fetchClassType = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'classType'));
        const types = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched class types:', types); // <-- Add this line
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
              onPress={() => handleSubjectSelect(subj.id)}
              style={[
                styles.option,
                selectedSubject === subj.id && styles.selected,
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
                onPress={() => setSelectedProfessor(prof.id)}
                style={[
                  styles.option,
                  selectedProfessor === prof.id && styles.selected,
                ]}
              >
                <Text>{prof.name}</Text>
              </TouchableOpacity>
            ))
          ) : selectedSubject ? (
            <Text style={{ fontStyle: 'italic' }}>No teachers for this subject</Text>
          ) : null}
          <Text style={styles.label}>Class Type:</Text>
          <View style={styles.pickerWrapper}>
            <Text>Class Type:</Text>
            <Picker
              selectedValue={selectedClassType}
              onValueChange={(itemValue) => setSelectedClassType(itemValue)}
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
            value={date}
            onChangeText={setDate}
            style={styles.input}
            placeholder="e.g. 2025-06-12"
          />
          <Text style={styles.label}>Start Time:</Text>
          <TextInput
            value={startTime}
            onChangeText={setStartTime}
            style={styles.input}
            placeholder="e.g. 14:30"
          />

          <Text style={styles.label}>End Time:</Text>
          <TextInput
            value={endTime}
            onChangeText={setEndTime}
            style={styles.input}
            placeholder="e.g. 16:00"
          />

          <Text style={styles.label}>Additional Notes:</Text>
          <TextInput
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            style={styles.input}
            placeholder="Optional notes..."
          />

          <Text style={styles.label}>People Limit (optional):</Text>
          <TextInput
            value={peopleLimit}
            onChangeText={setPeopleLimit}
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
  overflow: 'hidden', height: 40, justifyContent: 'center',},
});

export default AddClass;