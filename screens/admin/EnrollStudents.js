import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import StudentEnrollCard from '../../components/StudentEnrollCard';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EnrollStudents({ navigation }) {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentIdFilter, setStudentIdFilter] = useState('');
  const [classIdFilter, setClassIdFilter] = useState('');
  const [sortAlphabetically, setSortAlphabetically] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classTeachers, setClassTeachers] = useState({}); // { [classId]: teacherName }
  const [classSubjects, setClassSubjects] = useState({}); // { [classId]: subjectName }

  useFocusEffect(
    useCallback(() => {
      fetchStudents();
    }, [])
  );

  useEffect(() => {
    applyFilters();
  }, [sortAlphabetically, students, studentIdFilter]);

  const fetchStudents = async () => {
    const q = query(collection(db, 'users'), where('roles', 'array-contains', 'student'));
    const snapshot = await getDocs(q);
    const studentList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setStudents(studentList);
    setFilteredStudents(studentList);
  };

  const applyFilters = () => {
    let filtered = students;
    if (studentIdFilter.trim()) {
      filtered = filtered.filter(t => t.id.includes(studentIdFilter.trim()));
    }
    filtered.sort((a, b) => {
      if (!a.name || !b.name) return 0;
      return sortAlphabetically
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });
    setFilteredStudents(filtered);
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setLoadingClasses(true);
    // Fetch all classes
    const classSnap = await getDocs(collection(db, 'classes'));
    const classList = classSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setClasses(classList);
    classList.forEach(cls => {
      fetchTeacherName(cls.professor, cls.id);
      fetchSubjectName(cls.subject, cls.id);
    });
    setLoadingClasses(false);
  };

  const fetchTeacherName = async (teacherRef, classId) => {
    if (!teacherRef) return;
    let teacherId = teacherRef;
    // If it's a reference string like "users/abc123", extract the ID
    if (typeof teacherRef === 'string' && teacherRef.includes('/')) {
      teacherId = teacherRef.split('/').pop();
    } else if (teacherRef.id) {
      teacherId = teacherRef.id;
    }
    try {
      const teacherSnap = await getDoc(doc(db, 'users', teacherId));
      if (teacherSnap.exists()) {
        setClassTeachers(prev => ({
          ...prev,
          [classId]: teacherSnap.data().name || teacherId,
        }));
      }
    } catch (e) {
      setClassTeachers(prev => ({
        ...prev,
        [classId]: teacherId,
      }));
    }
  };

  const fetchSubjectName = async (subjectRef, classId) => {
    if (!subjectRef) return;
    let subjectId = subjectRef;
    // If it's a reference string like "subjects/abc123", extract the ID
    if (typeof subjectRef === 'string' && subjectRef.includes('/')) {
      subjectId = subjectRef.split('/').pop();
    } else if (subjectRef.id) {
      subjectId = subjectRef.id;
    }
    try {
      const subjectSnap = await getDoc(doc(db, 'subjects', subjectId));
      if (subjectSnap.exists()) {
        setClassSubjects(prev => ({
          ...prev,
          [classId]: subjectSnap.data().name || subjectId,
        }));
      }
    } catch (e) {
      setClassSubjects(prev => ({
        ...prev,
        [classId]: subjectId,
      }));
    }
  };

  const handleEnroll = async (student, classItem) => {
    try {
      await addDoc(collection(db, 'enrolment'), {
        student: doc(db, 'users', student.id),
        class: doc(db, 'classes', classItem.id),
        enrolledAt: new Date()
      });
      Alert.alert('Success', `Enrolled ${student.name} in class ${classItem.classType}`);
      setSelectedStudent(null); // Optionally go back to student list
    } catch (err) {
      Alert.alert('Error', 'Failed to enroll student.');
      console.error(err);
    }
  };

  const renderItem = ({ item }) => (
    <StudentEnrollCard
      student={item}
      onEdit={(student) => navigation.navigate('EditEnrollment', { studentId: student.id })}
      onSelect={handleSelectStudent}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <Text style={styles.header}>Enroll Students</Text>

        {!selectedStudent && (
          <>
            <Text>Filters</Text>
            <TextInput
              style={styles.input}
              placeholder="Student ID"
              value={studentIdFilter}
              onChangeText={setStudentIdFilter}
            />
            <View style={styles.filtersRow}>
              <TouchableOpacity style={styles.filterButton} onPress={() => setSortAlphabetically(!sortAlphabetically)}>
                <Text>Alphabetical Order</Text>
                <Text>{sortAlphabetically ? '▼' : '▲'}</Text>
              </TouchableOpacity>
              <Button title="Search" onPress={applyFilters} />
            </View>

            <FlatList
              data={filteredStudents}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
          </>
        )}

        {selectedStudent && (
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>
              Select a class to enroll {selectedStudent.name}:
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Search by Class ID"
              value={classIdFilter}
              onChangeText={setClassIdFilter}
            />
            {loadingClasses ? (
              <Text>Loading classes...</Text>
            ) : (
              <FlatList
                data={classes.filter(cls =>
                  classIdFilter.trim() === '' ||
                  cls.id.toLowerCase().includes(classIdFilter.trim().toLowerCase())
                )}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                  // Convert Firestore Timestamp or JS Date to Date object
                  const startDateObj = item.start
                    ? new Date(item.start.seconds ? item.start.seconds * 1000 : item.start)
                    : null;
                  const endDateObj = item.end
                    ? new Date(item.end.seconds ? item.end.seconds * 1000 : item.end)
                    : null;

                  // Use only the start date for "Date"
                  const date = startDateObj
                    ? startDateObj.toLocaleDateString()
                    : '';
                  const startTime = startDateObj
                    ? startDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '';
                  const endTime = endDateObj
                    ? endDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '';

                  return (
                    <TouchableOpacity
                      style={styles.classOption}
                      onPress={() => {
                        Alert.alert(
                          'Confirm Enrollment',
                          `Enroll ${selectedStudent.name} in ${classSubjects[item.id] || 'this class'}?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Enroll', style: 'default', onPress: () => handleEnroll(selectedStudent, item) }
                          ]
                        );
                      }}
                    >
                      <Text style={{ fontWeight: 'bold' }}>
                        {classSubjects[item.id] || 'Loading...'} - {item.classType}
                      </Text>
                      <Text>
                        Teacher: {classTeachers[item.id] || 'Loading...'}
                      </Text>
                      <Text>
                        Date: {date}
                      </Text>
                      <Text>
                        Start Time: {startTime}
                      </Text>
                      <Text>
                        End Time: {endTime}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
            <Button title="Back to Students" onPress={() => setSelectedStudent(null)} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  addButton: { backgroundColor: '#cde', padding: 8, borderRadius: 6, alignSelf: 'flex-end', marginBottom: 12 },
  input: { borderColor: '#ccc', borderWidth: 1, padding: 8, marginBottom: 12 },
  filtersRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, justifyContent: 'space-between' },
  studentEnrollCard: { padding: 12, borderWidth: 1, borderColor: '#ccc', marginBottom: 8, borderRadius: 6 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  filterButton: { flexDirection: 'row', marginLeft: 8, alignItems: 'center', gap: 4 },
  actions: { flexDirection: 'row', marginTop: 8 },
  editBtn: { backgroundColor: '#4caf50', padding: 10, borderRadius: 6, marginRight: 8 },
  selectBtn: { backgroundColor: '#2196f3', padding: 10, borderRadius: 6 },
  actionText: { color: '#fff', fontWeight: 'bold' },
  classOption: { padding: 14, backgroundColor: '#f2f6fc', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#cce' },
});