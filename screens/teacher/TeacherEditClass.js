import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, getDocs, collection, Timestamp } from 'firebase/firestore';

const TeacherEditClass = ({ route, navigation }) => {
  const { classId } = route.params;
  const teacherId = getAuth().currentUser?.uid;

  const [classData, setClassData] = useState(null);
  const [teacherName, setTeacherName] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const classRef = doc(db, 'classes', classId);
      const classSnap = await getDoc(classRef);
      if (!classSnap.exists()) {
        Alert.alert('Error', 'Class not found');
        navigation.goBack();
        return;
      }
      const data = classSnap.data();
      setClassData(data);

      const userRef = doc(db, 'users', teacherId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      setTeacherName(userData.name || teacherId); 
      const teacherSubjects = userData.subjects || [];

      const subjectsSnap = await getDocs(collection(db, 'subjects'));
      const allSubjects = subjectsSnap.docs.map(d => ({
        id: d.id,
        name: d.data().name,
      }));
      const filtered = allSubjects.filter(s => teacherSubjects.includes(s.name));
      setSubjects(filtered);

      if (data.subject?.id) setSubject(data.subject.id);
      else if (typeof data.subject === 'string') setSubject(data.subject.split('/').pop());
      if (data.start?.toDate && data.end?.toDate) {
        const startDate = data.start.toDate();
        const endDate = data.end.toDate();
        setDate(startDate.toISOString().split('T')[0]);
        setStartTime(startDate.toTimeString().slice(0, 5));
        setEndTime(endDate.toTimeString().slice(0, 5));
      }
    };
    fetchData();
  }, [classId, teacherId]);

  const onSave = async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('Invalid date', 'Date must be in YYYY-MM-DD format.');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
      Alert.alert('Invalid time', 'Times must be in HH:MM format.');
      return;
    }
    const [year, month, day] = date.split('-').map(Number);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startDate = new Date(year, month - 1, day, startHour, startMinute);
    const endDate = new Date(year, month - 1, day, endHour, endMinute);
    if (endDate <= startDate) {
      Alert.alert('Invalid time', 'End time must be after start time.');
      return;
    }
    try {
      const classRef = doc(db, 'classes', classId);
      await updateDoc(classRef, {
        subject: doc(db, 'subjects', subject),
        start: Timestamp.fromDate(startDate),
        end: Timestamp.fromDate(endDate),
      });
      Alert.alert('Success', 'Class updated!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Could not update class.');
    }
  };

  if (!classData) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Class ID</Text>
      <TextInput
        style={[styles.input, styles.transparentInput]}
        value={classId}
        editable={false}
      />

      <Text style={styles.label}>Teacher</Text>
      <TextInput
        style={[styles.input, styles.transparentInput]}
        value={teacherName}
        editable={false}
      />

      <Text style={styles.label}>Subject</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={subject}
          onValueChange={setSubject}
        >
          {subjects.map(s => (
            <Picker.Item key={s.id} label={s.name} value={s.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
      />

      <Text style={styles.label}>Start Time (HH:MM, 24h)</Text>
      <TextInput
        style={styles.input}
        value={startTime}
        onChangeText={setStartTime}
        placeholder="HH:MM"
        keyboardType="numbers-and-punctuation"
      />

      <Text style={styles.label}>End Time (HH:MM, 24h)</Text>
      <TextInput
        style={styles.input}
        value={endTime}
        onChangeText={setEndTime}
        placeholder="HH:MM"
        keyboardType="numbers-and-punctuation"
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <View style={{ width: 16 }} />
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F6FC', padding: 20 },
  label: { fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#ccc', marginBottom: 8 },
  transparentInput: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ccc' },
  pickerWrapper: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginBottom: 8 },
  buttonRow: {flexDirection: 'row', marginTop: 20, justifyContent: 'center', gap: 16,},
  saveButton: { backgroundColor: '#22C55E', padding: 12, borderRadius: 6, alignItems: 'center', flex: 1 },
  cancelButton: { backgroundColor: '#FF6B6B', padding: 12, borderRadius: 6, alignItems: 'center', flex: 1 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default TeacherEditClass;