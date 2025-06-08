import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, FlatList, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { SafeAreaView } from 'react-native-safe-area-context';

const EditClass = ({ route, navigation }) => {
  const { classData } = route.params;

  const [subjectOptions, setSubjectOptions] = useState([]);
  const [professorOptions, setProfessorOptions] = useState([]);
  const [classTypeOptions, setClassTypeOptions] = useState([]);
  const [allProfessors, setAllProfessors] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState(classData.subjectId || '');
  const [selectedProfessor, setSelectedProfessor] = useState(classData.professorId || '');
  const [selectedClassType, setSelectedClassType] = useState(classData.classType || '');
  const [date, setDate] = useState(() => {
    if (classData.start instanceof Date) return classData.start.toISOString().slice(0, 10);
    if (typeof classData.start === 'string') return new Date(classData.start).toISOString().slice(0, 10);
    return '';
  });
  const [notes, setNotes] = useState(classData.additionalNotes || '');
  const [peopleLimit, setPeopleLimit] = useState(
    classData.peopleLimit !== undefined && classData.peopleLimit !== null ? String(classData.peopleLimit) : ''
  );
  const [startTime, setStartTime] = useState(
    classData.start ? new Date(classData.start).toISOString().slice(11, 16) : ''
  );
  const [endTime, setEndTime] = useState(
    classData.end ? new Date(classData.end).toISOString().slice(11, 16) : ''
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const subjectsSnap = await getDocs(collection(db, 'subjects'));
        setSubjectOptions(
          subjectsSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }))
        );

        const usersSnap = await getDocs(collection(db, 'users'));
        const teachers = usersSnap.docs
          .filter(doc => (doc.data().roles || []).includes('teacher'))
          .map(doc => ({
            id: doc.id,
            name: doc.data().name,
            subjects: doc.data().subjects || [],
          }));
        setAllProfessors(teachers);

        const typesSnap = await getDocs(collection(db, 'classType'));
        setClassTypeOptions(
          typesSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }))
        );
      } catch (err) {
        console.log(err);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const selectedSubjectName = subjectOptions.find(s => s.id === selectedSubject)?.name;
    if (selectedSubject && selectedSubjectName) {
      setProfessorOptions(
        allProfessors.filter(prof =>
          Array.isArray(prof.subjects) && prof.subjects.includes(selectedSubjectName)
        )
      );
      // If current professor doesn't teach this subject, clear selection
      if (!allProfessors.find(p => p.id === selectedProfessor && Array.isArray(p.subjects) && p.subjects.includes(selectedSubjectName))) {
        setSelectedProfessor('');
      }
    } else {
      setProfessorOptions(allProfessors);
    }
  }, [selectedSubject, allProfessors, subjectOptions]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(`${date}T${endTime}:00`);

      // Validation: Required fields
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
        setLoading(false);
        Alert.alert('Missing Fields', 'Please fill in all required fields with valid data.');
        return;
      }

      // Validation: End time must be after start time
      if (endDateTime <= startDateTime) {
        setLoading(false);
        Alert.alert('Invalid Time', 'End time must be after start time.');
        return;
      }

      await updateDoc(doc(db, 'classes', classData.id), {
        subject: `subjects/${selectedSubject}`,
        professor: `users/${selectedProfessor}`,
        classType: selectedClassType,
        start: startDateTime,
        end: endDateTime,
        peopleLimit: peopleLimit === '' ? null : Number(peopleLimit),
        additionalNotes: notes,
      });
      Alert.alert('Success', 'Class updated!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderOptionButton = (item, selectedId, setSelectedId) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.optionButton,
        selectedId === item.id && styles.optionButtonSelected,
      ]}
      onPress={() => setSelectedId(item.id)}
    >
      <Text style={selectedId === item.id ? styles.optionTextSelected : styles.optionText}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const selectedSubjectName = subjectOptions.find(s => s.id === selectedSubject)?.name;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F6FC' }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Edit Class</Text>

        <Text style={styles.label}>Subject</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedSubject}
            onValueChange={setSelectedSubject}
            style={styles.picker}
          >
            {subjectOptions.map(item => (
              <Picker.Item key={item.id} label={item.name} value={item.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Teacher</Text>
        <View style={styles.optionList}>
          {professorOptions.map(item =>
            renderOptionButton(item, selectedProfessor, setSelectedProfessor)
          )}
        </View>

        <Text style={styles.label}>Class Type</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedClassType}
            onValueChange={(itemValue) => setSelectedClassType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Class Type" value="" />
            {classTypeOptions.map(type => (
              <Picker.Item key={type.id} label={type.name} value={type.name} />
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

        <Text style={styles.label}>Start Time</Text>
        <TextInput
          style={styles.input}
          value={startTime}
          onChangeText={setStartTime}
          placeholder="HH:MM"
        />

        <Text style={styles.label}>End Time</Text>
        <TextInput
          style={styles.input}
          value={endTime}
          onChangeText={setEndTime}
          placeholder="HH:MM"
        />

        <Text style={styles.label}>People Limit</Text>
        <TextInput
          style={styles.input}
          value={peopleLimit}
          onChangeText={setPeopleLimit}
          placeholder="Leave empty for no limit"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, { minHeight: 60 }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes"
          multiline
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, color: '#4A90E2', fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginVertical: 10, fontWeight: '600' },
  input: { borderColor: '#ccc', borderWidth: 1, borderRadius: 6, backgroundColor: '#fff', padding: 10, marginBottom: 10 },
  pickerWrapper: { borderColor: '#ccc', borderWidth: 1, borderRadius: 6, marginBottom: 10 },
  picker: { height: 56, width: '100%' },
  optionList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionButton: { backgroundColor: '#eee', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginBottom: 6 },
  optionButtonSelected: { backgroundColor: '#4A90E2' },
  optionText: { color: '#333' },
  optionTextSelected: { color: '#fff', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#4A90E2', padding: 12, borderRadius: 6, marginTop: 20, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default EditClass;

// When displaying class type in your card/component:
// const classTypeName = classTypeOptions.find(opt => opt.id === item.classType)?.name || item.classType;

// For teacher
// const professorId = item.professor?.split('/')[1];
// const professorName = allProfessors.find(p => p.id === professorId)?.name || 'Unknown';

// For class type
// const classTypeName = classTypeOptions.find(opt => opt.id === item.classType)?.name || item.classType;