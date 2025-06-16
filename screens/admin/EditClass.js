import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditClass({ route, navigation }) {
  const { classData } = route.params;
  const [form, setForm] = useState(null);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [professorOptions, setProfessorOptions] = useState([]);
  const [classTypeOptions, setClassTypeOptions] = useState([]);
  const [allProfessors, setAllProfessors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subjectsSnap = await getDocs(collection(db, 'subjects'));
        const subjectOpts = subjectsSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
        setSubjectOptions(subjectOpts);

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
        const typeOpts = typesSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
        setClassTypeOptions(typeOpts);

        setForm({
          subjectId: classData.subjectId || '',
          professorId: classData.professorId || '',
          classType: classData.classType || '',
          date: classData.start
            ? (classData.start instanceof Date
              ? classData.start.toISOString().slice(0, 10)
              : new Date(classData.start).toISOString().slice(0, 10))
            : '',
          startTime: classData.start
            ? (classData.start instanceof Date
              ? classData.start.toISOString().slice(11, 16)
              : new Date(classData.start).toISOString().slice(11, 16))
            : '',
          endTime: classData.end
            ? (classData.end instanceof Date
              ? classData.end.toISOString().slice(11, 16)
              : new Date(classData.end).toISOString().slice(11, 16))
            : '',
          peopleLimit: classData.peopleLimit !== undefined && classData.peopleLimit !== null ? String(classData.peopleLimit) : '',
          additionalNotes: classData.additionalNotes || '',
        });

        setLoading(false);
      } catch (err) {
        Alert.alert('Failed to Load Class Details',
          'There was a problem loading the class information. Please check your connection and try again.');
        setLoading(false);
      }
    };
    fetchData();
  }, [classData]);

  useEffect(() => {
    if (!form) return;
    const selectedSubjectName = subjectOptions.find(s => s.id === form.subjectId)?.name;
    if (form.subjectId && selectedSubjectName) {
      setProfessorOptions(
        allProfessors.filter(prof =>
          Array.isArray(prof.subjects) && prof.subjects.includes(selectedSubjectName)
        )
      );
      if (!allProfessors.find(p => p.id === form.professorId && Array.isArray(p.subjects) && p.subjects.includes(selectedSubjectName))) {
        setForm(f => ({ ...f, professorId: '' }));
      }
    } else {
      setProfessorOptions(allProfessors);
    }
  }, [form?.subjectId, allProfessors, subjectOptions]);

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form) return;
    setLoading(true);
    try {
      const startDateTime = new Date(`${form.date}T${form.startTime}:00`);
      const endDateTime = new Date(`${form.date}T${form.endTime}:00`);

      // required fields
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
        setLoading(false);
        Alert.alert('Missing Fields', 'Please fill in all required fields with valid data.');
        return;
      }

      if (endDateTime <= startDateTime) {
        setLoading(false);
        Alert.alert('Invalid Time', 'End time must be after start time.');
        return;
      }

      await updateDoc(doc(db, 'classes', classData.id), {
        subject: `subjects/${form.subjectId}`,
        professor: `users/${form.professorId}`,
        classType: form.classType,
        start: startDateTime,
        end: endDateTime,
        peopleLimit: form.peopleLimit === '' ? null : Number(form.peopleLimit),
        additionalNotes: form.additionalNotes || '',
      });
      Alert.alert('Success', 'Class updated!');
      navigation.navigate('ManageClasses');
    } catch (err) {
      Alert.alert(
        'Update Failed',
        'Something went wrong while updating the class. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading || !form) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F6FC', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: '#F2F6FC' }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

        <Text style={styles.title}>Edit Class</Text>
        <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.navigate('ManageClasses')}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Back</Text>
                  </TouchableOpacity>
                  </View>

        <Text style={styles.label}>Subject</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.subjectId}
            onValueChange={v => handleChange('subjectId', v)}
            style={styles.picker}
          >
            {subjectOptions.map(item => (
              <Picker.Item key={item.id} label={item.name} value={item.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Teacher</Text>
        <View style={styles.optionList}>
          {professorOptions.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.optionButton,
                form.professorId === item.id && styles.optionButtonSelected,
              ]}
              onPress={() => handleChange('professorId', item.id)}
            >
              <Text style={form.professorId === item.id ? styles.optionTextSelected : styles.optionText}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Class Type</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.classType}
            onValueChange={v => handleChange('classType', v)}
            style={styles.picker}
          >
            <Picker.Item label="Select Class Type" value="" />
            {classTypeOptions.map(type => (
              <Picker.Item key={type.id} label={type.name} value={type.name} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Date</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text>{form.date || 'Select Date'}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={form.date ? new Date(form.date) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                const formattedDate = selectedDate.toISOString().slice(0, 10);
                handleChange('date', formattedDate);
              }
            }}
          />
        )}


        <Text style={styles.label}>Start Time</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowStartTimePicker(true)}>
          <Text>{form.startTime || 'Select Start Time'}</Text>
        </TouchableOpacity>
        {showStartTimePicker && (
          <DateTimePicker
            value={form.startTime ? new Date(`${form.date}T${form.startTime}:00`) : new Date()}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartTimePicker(false);
              if (selectedDate) {
                const hours = selectedDate.getHours().toString().padStart(2, '0');
                const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
                handleChange('startTime', `${hours}:${minutes}`);
              }
            }}
          />
        )}

        <Text style={styles.label}>End Time</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowEndTimePicker(true)}>
          <Text>{form.endTime || 'Select End Time'}</Text>
        </TouchableOpacity>
        {showEndTimePicker && (
          <DateTimePicker
            value={form.endTime ? new Date(`${form.date}T${form.endTime}:00`) : new Date()}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndTimePicker(false);
              if (selectedDate) {
                const hours = selectedDate.getHours().toString().padStart(2, '0');
                const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
                handleChange('endTime', `${hours}:${minutes}`);
              }
            }}
          />
        )}

        <Text style={styles.label}>People Limit</Text>
        <TextInput
          style={styles.input}
          value={form.peopleLimit}
          onChangeText={v => handleChange('peopleLimit', v)}
          placeholder="Leave empty for no limit"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, { minHeight: 60 }]}
          value={form.additionalNotes}
          onChangeText={v => handleChange('additionalNotes', v)}
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
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, color: '#4A90E2', fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginVertical: 10, fontWeight: '600' },
  input: { borderColor: '#5996b5', borderWidth: 1, borderRadius: 6, backgroundColor: '#fff', padding: 10, marginBottom: 10 },
  pickerWrapper: { borderColor: '#5996b5', borderWidth: 1, borderRadius: 6, marginBottom: 10, backgroundColor: '#ffffff' },
  picker: { height: 56, width: '100%' },
  optionList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionButton: { backgroundColor: '#fff', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginBottom: 6, borderColor: '#5996b5', borderWidth: 1 },
  optionButtonSelected: { backgroundColor: '#4A90E2' },
  optionText: { color: '#333' },
  optionTextSelected: { color: '#fff', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#4A90E2', padding: 12, borderRadius: 6, marginTop: 20, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  backBtn: { backgroundColor: '#5996b5', padding: 12, borderRadius: 6 },
});