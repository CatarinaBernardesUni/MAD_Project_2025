import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EnrollStudentList from '../../components/EnrollStudentList';
import EnrollClassList from '../../components/EnrollClassList';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useFocusEffect } from '@react-navigation/native';

export default function EnrollStudents({ navigation }) {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentIdFilter, setStudentIdFilter] = useState('');
  const [classIdFilter, setClassIdFilter] = useState('');
  const [sortAlphabetically, setSortAlphabetically] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classTeachers, setClassTeachers] = useState({}); 
  const [classSubjects, setClassSubjects] = useState({}); 
  const [classCounts, setClassCounts] = useState({}); 

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
    const enrollstudentList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setStudents(enrollstudentList);
    setFilteredStudents(enrollstudentList);
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

    const classSnap = await getDocs(collection(db, 'classes'));
    const today = new Date();
    today.setHours(0, 0, 0, 0); // midnight today

    // filter out classes before today and sort by date
    const classList = classSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(cls => {
        const start = cls.start ? new Date(cls.start.seconds ? cls.start.seconds * 1000 : cls.start) : null;
        return start && start >= today;
      })
      .sort((a, b) => {
        const aDate = a.start ? new Date(a.start.seconds ? a.start.seconds * 1000 : a.start) : 0;
        const bDate = b.start ? new Date(b.start.seconds ? b.start.seconds * 1000 : b.start) : 0;
        return aDate - bDate;
      });

    setClasses(classList);

    // all enrollments and count per class
    const enrollmentSnap = await getDocs(collection(db, 'enrolment'));
    const counts = {};
    enrollmentSnap.docs.forEach(docSnap => {
      const data = docSnap.data();
      let classId = data.class?.id || (typeof data.class === 'string' ? data.class.split('/').pop() : null);
      if (classId) {
        counts[classId] = (counts[classId] || 0) + 1;
      }
    });
    setClassCounts(counts);

    classList.forEach(cls => {
      fetchTeacherName(cls.professor, cls.id);
      fetchSubjectName(cls.subject, cls.id);
    });

    setLoadingClasses(false);
  };

  const fetchTeacherName = async (teacherRef, classId) => {
    if (!teacherRef) return;
    let teacherId = teacherRef;
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
    const enrolledCount = classCounts[classItem.id] || 0;
    const limit = classItem.peopleLimit ?? classItem.limit ?? Infinity;
    if (enrolledCount >= limit) {
      Alert.alert('Class Full', 'This class has reached its enrollment limit.');
      return;
    }

    // check if student is already enrolled 
    const enrollmentSnap = await getDocs(collection(db, 'enrolment'));
    const alreadyEnrolled = enrollmentSnap.docs.some(docSnap => {
      const data = docSnap.data();
      const studentId = data.student?.id || (typeof data.student === 'string' ? data.student.split('/').pop() : null);
      const classId = data.class?.id || (typeof data.class === 'string' ? data.class.split('/').pop() : null);
      return studentId === student.id && classId === classItem.id;
    });

    if (alreadyEnrolled) {
      Alert.alert('Already Enrolled', `${student.name} is already enrolled in this class.`);
      return;
    }

    try {
      await addDoc(collection(db, 'enrolment'), {
        student: doc(db, 'users', student.id),
        class: doc(db, 'classes', classItem.id),
        enrolledAt: new Date()
      });
      Alert.alert('Success', `Enrolled ${student.name} in class ${classItem.classType}`);
      setSelectedStudent(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to enroll student.');
      console.error(err);
    }
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <Text style={styles.header}>Enroll Students</Text>
        {!selectedStudent ? (
          <EnrollStudentList
            students={students}
            studentIdFilter={studentIdFilter}
            setStudentIdFilter={setStudentIdFilter}
            sortAlphabetically={sortAlphabetically}
            setSortAlphabetically={setSortAlphabetically}
            applyFilters={applyFilters}
            filteredStudents={filteredStudents}
            onSelectStudent={handleSelectStudent}
            navigation={navigation}
            styles={styles}
          />
        ) : (
          <EnrollClassList
            classes={classes}
            classIdFilter={classIdFilter}
            setClassIdFilter={setClassIdFilter}
            loadingClasses={loadingClasses}
            classSubjects={classSubjects}
            classTeachers={classTeachers}
            classCounts={classCounts}
            selectedStudent={selectedStudent}
            handleEnroll={handleEnroll}
            setSelectedStudent={setSelectedStudent}
            styles={styles}
          />
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