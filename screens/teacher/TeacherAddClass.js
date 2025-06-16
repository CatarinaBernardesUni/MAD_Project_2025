import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, getDocs, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddClass = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [subjects, setSubjects] = useState([]);
  const [classType, setClassType] = useState([]);
  const [form, setForm] = useState({
    subjectId: '',
    classType: '',
    date: '',
    startTime: '',
    endTime: '',
    additionalNotes: '',
    peopleLimit: '',
  });
  const [loading, setLoading] = useState(false);

  const teacherId = getAuth().currentUser?.uid;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleChange('date', formattedDate);
    }
  };

  const handleStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      const formattedTime = selectedTime.toTimeString().split(' ')[0].slice(0, 5);
      handleChange('startTime', formattedTime);
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      const formattedTime = selectedTime.toTimeString().split(' ')[0].slice(0, 5);
      handleChange('endTime', formattedTime);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', teacherId));
      let teacherSubjectNames = [];
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.roles && userData.roles.includes('teacher')) {
          teacherSubjectNames = userData.subjects || [];
        }
      }
      const subjSnap = await getDocs(collection(db, 'subjects'));
      const fetchedSubjects = subjSnap.docs
        .filter(doc => teacherSubjectNames.includes(doc.data().name))
        .map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));
      setSubjects(fetchedSubjects);
    } catch (err) {
      Alert.alert(
        'Loading Error',
        'We encountered a problem while loading the dropdown data. Please try again later.',
      );
    }
  };

  useEffect(() => {
    const fetchClassType = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'classType'));
        const types = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClassType(types);
      } catch (error) {
        Alert.alert(
          'Loading Error',
          'We encountered a problem while loading the class types. Please try again later.',
        );
      }
    };
    fetchClassType();
  }, []);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleAddClass = async () => {
    const startDateTime = new Date(`${form.date}T${form.startTime}:00`);
    const endDateTime = new Date(`${form.date}T${form.endTime}:00`);

    if (
      !form.subjectId ||
      !form.classType ||
      !form.date ||
      !form.startTime ||
      !form.endTime ||
      isNaN(startDateTime.getTime()) ||
      isNaN(endDateTime.getTime())
    ) {
      Alert.alert(
        'Incomplete Information',
        'Please fill in all required fields with valid data before continuing.',
      );
      return;
    }

    if (endDateTime <= startDateTime) {
      Alert.alert(
        'Invalid Time Range',
        'End time must be after start time.',
      );
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'classes'), {
        subject: doc(db, 'subjects', form.subjectId),
        professor: doc(db, 'users', teacherId),
        classType: form.classType,
        start: Timestamp.fromDate(startDateTime),
        end: Timestamp.fromDate(endDateTime),
        additionalNotes: form.additionalNotes || '',
        peopleLimit: form.peopleLimit === '' ? null : Number(form.peopleLimit),
        description: '',
      });
      Alert.alert(
        'Success',
        'The class has been added successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert(
        'Failed to Add Class',
        'We encountered a problem while adding the class. Please try again later.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Class</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Back</Text>
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
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{form.date ? form.date : 'Select Date'}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={form.date ? new Date(form.date) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Text style={styles.label}>Start Time:</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Text>{form.startTime ? form.startTime : 'Select Start Time'}</Text>
          </TouchableOpacity>
          {showStartTimePicker && (
            <DateTimePicker
              value={form.startTime ? new Date(`${form.date}T${form.startTime}:00`) : new Date()}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleStartTimeChange}
            />
          )}

          <Text style={styles.label}>End Time:</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Text>{form.endTime ? form.endTime : 'Select End Time'}</Text>
          </TouchableOpacity>
          {showEndTimePicker && (
            <DateTimePicker
              value={form.endTime ? new Date(`${form.date}T${form.endTime}:00`) : new Date()}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleEndTimeChange}
            />
          )}

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
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold' },
  addButton: { backgroundColor: '#5996b5', padding: 8, borderRadius: 6, alignSelf: 'flex-end', marginBottom: 12 },
  label: { fontWeight: 'bold', marginTop: 12 },
  input: { borderColor: '#ccc', borderWidth: 1, padding: 8, marginBottom: 12, borderRadius: 6 },
  option: { padding: 10, backgroundColor: '#eee', borderRadius: 6, marginVertical: 4, borderColor: '#ccc', borderWidth: 1 },
  selected: { backgroundColor: '#D0E6FF', },
  addButton2: { backgroundColor: '#4A90E2', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 20 },
  pickerWrapper: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 12,
    height: 50, justifyContent: 'center', marginTop: 12
  },
  picker: { height: 56, width: '100%' },
});

export default AddClass;