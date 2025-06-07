import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const AddClass = ({ navigation }) => {
  const [subjects, setSubjects] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedProfessor, setSelectedProfessor] = useState('');
  const [startDateString, setStartDateString] = useState('');
  const [endDateString, setEndDateString] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [peopleLimit, setPeopleLimit] = useState('');
  const [loading, setLoading] = useState(false);

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
    const startDate = parseDate(startDateString);
    const endDate = parseDate(endDateString);

    if (!selectedSubject || !selectedProfessor || !startDate || !endDate) {
      alert('Please fill in all required fields with valid data');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'classes'), {
        subject: `subjects/${selectedSubject}`,
        professor: `users/${selectedProfessor}`,
        start: Timestamp.fromDate(startDate),
        end: Timestamp.fromDate(endDate),
        additionalNotes,
        peopleLimit: Number(peopleLimit) || 0,
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
    fetchDropdownData();
  }, []);

  return (
    <View style={styles.container}>
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

        <Text style={styles.label}>Professor:</Text>
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
          <Text style={{ fontStyle: 'italic' }}>No professors for this subject</Text>
        ) : null}

        <Text style={styles.label}>Start Date & Time:</Text>
        <TextInput
          value={startDateString}
          onChangeText={setStartDateString}
          style={styles.input}
          placeholder="e.g. 2025-06-12 14:30"
        />

        <Text style={styles.label}>End Date & Time:</Text>
        <TextInput
          value={endDateString}
          onChangeText={setEndDateString}
          style={styles.input}
          placeholder="e.g. 2025-06-12 16:00"
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {fontSize: 24, fontWeight: 'bold', marginBottom: 12},
  title: { fontSize: 22, fontWeight: 'bold' },
  addButton: { backgroundColor: '#cde', padding: 8, borderRadius: 6, alignSelf: 'flex-end', marginBottom: 12 },
  label: { fontWeight: 'bold', marginTop: 12 },
  input: {borderColor: '#ccc', borderWidth: 1, padding: 8, marginBottom: 12, borderRadius: 6},
  option: {padding: 10, backgroundColor: '#eee', borderRadius: 6, marginVertical: 4,},
  selected: {backgroundColor: '#D0E6FF',},
  addButton2: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
});

export default AddClass;