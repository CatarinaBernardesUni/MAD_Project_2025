import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, getDocs, addDoc, Timestamp, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddClass = ({ navigation }) => {
  // form state
  const [form, setForm] = useState({
    subjectId: '',
    professorId: '',
    classType: '',
    date: new Date().toISOString().split('T')[0],
    startTime: new Date().toTimeString().substring(0, 5),
    endTime: new Date().toTimeString().substring(0, 5),
    additionalNotes: '',
    peopleLimit: '',
  });

  // picker controls
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // datetime
  const [selectedDate, setSelectedDate] = useState(new Date()); // for calendar picker
  const [selectedStartTime, setSelectedStartTime] = useState(new Date()); // for clock picker
  const [selectedEndTime, setSelectedEndTime] = useState(new Date()); // for clock picker

  // data from db
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [classTypes, setClassTypes] = useState([]);

  // Safe area
  const insets = useSafeAreaInsets();

  // handlers for picker
  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      handleChange('date', date.toISOString().split('T')[0]);
    }
  };

  const handleStartTimeChange = (event, date) => {
    setShowStartTimePicker(false);
    if (date) {
      setSelectedStartTime(date);
      handleChange('startTime', date.toTimeString().substring(0, 5)); // hh:mm
    }
  };

  const handleEndTimeChange = (event, date) => {
    setShowEndTimePicker(false);
    if (date) {
      setSelectedEndTime(date);
      handleChange('endTime', date.toTimeString().substring(0, 5)); // hh:mm
    }
  };

  // form handle
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // fetching data from db
  const fetchDropdownData = async () => {
    try {
      // subjects
      const subjSnap = await getDocs(collection(db, 'subjects'));
      setSubjects(
        subjSnap.docs.map((item) => ({
          id: item.id,
          name: item.data().name,
        }))
      );

      // professors
      const profSnap = await getDocs(collection(db, 'users'));
      setProfessors(
        profSnap.docs
          .filter((item) => item.data().roles?.includes('teacher'))
          .map((item) => ({
            id: item.id,
            name: item.data().name,
            subjects: item.data().subjects ?? [],
          }))
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch professors. Please try again later.');
    }
  };

  const fetchClassTypes = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'classType'));
      setClassTypes(
        snapshot.docs.map((item) => ({
          id: item.id,
          name: item.data().name,
        }))
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch class types. Please try again later.');
    }
  };

  useEffect(() => {
    fetchDropdownData();
    fetchClassTypes();
  }, []);

  // filter professors by subject
  useEffect(() => {
    if (form.subjectId) {
      const selected = subjects.find((s) => s.id === form.subjectId);
      if (selected) {
        setFilteredProfessors(
          professors.filter((p) => p.subjects?.includes(selected.name))
        );
      } else {
        setFilteredProfessors([]);
      }
    } else {
      setFilteredProfessors([]);
    }
  }, [form.subjectId, professors, subjects]);

  // adding class to db
  const handleAddClass = async () => {
    if (
      !form.subjectId ||
      !form.professorId ||
      !form.classType ||
      !form.date ||
      !form.startTime ||
      !form.endTime
    ) {
      Alert.alert(
        'Incomplete Form',
        'Please make sure you have selected a subject, professor, class type, date, start time, and end time before submitting.'
      );
      return;
    }

    const start = new Date(
      `${form.date}T${form.startTime}`
    );
    const end = new Date(
      `${form.date}T${form.endTime}`
    );

    if (isNaN(start) ||
      isNaN(end) ||
      end <= start) {
      Alert.alert(
        'Invalid Time Selection',
        'The end time must be later than the start time. Please review your time inputs.'
      );
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'classes'), {
        subject: doc(db, 'subjects', form.subjectId),
        professor: doc(db, 'users', form.professorId),
        classType: form.classType,
        start: Timestamp.fromDate(start),
        end: Timestamp.fromDate(end),
        additionalNotes: form.additionalNotes ?? '',
        peopleLimit: form.peopleLimit ? Number(form.peopleLimit) : null,
        description: '',
      });
      Alert.alert(
        'Class Added',
        `The class for ${form.classType} starting at ${start.toLocaleString()} has been successfully added.`,
        [{ text: 'OK', onPress: () => navigation.navigate('ManageClasses') }]
      );
    } catch (err) {
      Alert.alert(
        'Error Adding Class',
        'Something went wrong while adding the class. Please check your internet connection or try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Add New Class
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate('ManageClasses')}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>
            Subject:
          </Text>
          {subjects.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleChange('subjectId', item.id)}
              style={[
                styles.option,
                form.subjectId === item.id && styles.selected,
              ]}
            >
              <Text>{item.name}</Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.label}>
            Professor:
          </Text>
          {filteredProfessors.length > 0 ? (
            filteredProfessors.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleChange('professorId', item.id)}
                style={[
                  styles.option,
                  form.professorId === item.id && styles.selected,
                ]}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            ))
          ) : form.subjectId ? (
            <Text style={{ fontStyle: 'italic' }}>No professors for this subject</Text>
          ) : (
            <Text style={{ fontStyle: 'italic', marginBottom: 20 }}>Select subject first</Text>
          )}

          <Text style={styles.label}>
            Class Type:
          </Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={form.classType}
              onValueChange={(itemValue) =>
                handleChange('classType', itemValue)
              }
              style={styles.picker}
            >
              <Picker.Item label="Select Class Type" value="" />
              {classTypes.map((item) => (
                <Picker.Item
                  key={item.id}
                  label={item.name}
                  value={item.name}
                />
              ))}
            </Picker>
          </View>

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.input}>
            <Text>
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>Date: </Text>
              {selectedDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode='date'
              display='default'
              onChange={handleDateChange}
            />
          )}

          <TouchableOpacity
            onPress={() => setShowStartTimePicker(true)}
            style={styles.input}>
            <Text>
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>Start Time: </Text>
              {selectedStartTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </Text>
          </TouchableOpacity>

          {showStartTimePicker && (
            <DateTimePicker
              value={selectedStartTime}
              mode='time'
              is24Hour
              display='default'
              onChange={handleStartTimeChange}
            />
          )}

          <TouchableOpacity
            onPress={() => setShowEndTimePicker(true)}
            style={styles.input}>
            <Text>
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>End Time: </Text>
              {selectedEndTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </Text>
          </TouchableOpacity>

          {showEndTimePicker && (
            <DateTimePicker
              value={selectedEndTime}
              mode='time'
              is24Hour
              display='default'
              onChange={handleEndTimeChange}
            />
          )}

          <Text style={styles.label}>
            Additional Notes:
          </Text>
          <TextInput
            style={styles.textInput}
            value={form.additionalNotes}
            onChangeText={(text) => handleChange('additionalNotes', text)}
            placeholder='Optional notes...'
          />

          <Text style={styles.label}>
            People Limit (optional):
          </Text>
          <TextInput
            style={styles.textInput}
            value={form.peopleLimit}
            onChangeText={(text) => handleChange('peopleLimit', text)}
            keyboardType='numeric'
            placeholder='e.g. 20'
          />

          <TouchableOpacity
            disabled={loading}
            onPress={handleAddClass}
            style={styles.addBtn}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                Add Class
              </Text>
            )}

          </TouchableOpacity>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0f4f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  backBtn: { backgroundColor: '#5996b5', padding: 12, borderRadius: 6 },
  label: { fontWeight: 'bold', marginBottom: 12, fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#5996b5', padding: 12, borderRadius: 6, backgroundColor: '#fff', marginBottom: 12 },
  textInput: { borderWidth: 1, borderColor: '#5996b5', padding: 12, borderRadius: 6, backgroundColor: '#fff', marginBottom: 12 },
  pickerWrapper: { borderWidth: 1, borderColor: '#5996b5', borderRadius: 6, backgroundColor: '#fff', marginBottom: 12 },
  picker: { height: 50 },
  option: { padding: 12, backgroundColor: '#fff', borderRadius: 6, marginBottom: 12, borderWidth: 1, borderColor: '#5996b5' },
  selected: { backgroundColor: '#D0E6FF' },
  addBtn: { backgroundColor: '#5996b5', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 20 },
});

export default AddClass;