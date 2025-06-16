import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, addDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';
import StudentClassCard from '../../components/StudentClassCard';
import StudentClassFilters from '../../components/StudentClassFilters';
import useStudentClasses from '../../hooks/useStudentClasses';

export default function StudentClasses({ navigation }) {
  const {
    classes,
    classSubjects,
    classTeachers,
    classCounts,
    enrolledClassIds,
    loading,
    subjectOptions,
    teacherOptions,
    setTeacherOptions,
    allTeachers,
    setAllTeachers,
    setClassSubjects,
    setClassTeachers,
    setEnrolledClassIds,
    setClassCounts,
  } = useStudentClasses();

  const auth = getAuth();
  const studentId = auth.currentUser?.uid;

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filterClassId, setFilterClassId] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');

  const handleEnroll = async (classItem) => {
    const enrolledCount = classCounts[classItem.id] || 0;
    const limit = classItem.peopleLimit ?? classItem.limit ?? Infinity;
    if (enrolledCount >= limit) {
      Alert.alert('Class Full', 'This class has reached its enrollment limit.');
      return;
    }
    if (enrolledClassIds.includes(classItem.id)) {
      Alert.alert('Already Enrolled', 'You are already enrolled in this class.');
      return;
    }
    try {
      await addDoc(collection(db, 'enrolment'), {
        student: doc(db, 'users', studentId),
        class: doc(db, 'classes', classItem.id),
        enrolledAt: new Date()
      });
      Alert.alert('Success', `Enrolled in class ${classSubjects[classItem.id] || classItem.id}`);

      setEnrolledClassIds([...enrolledClassIds, classItem.id]);
      setClassCounts({
        ...classCounts,
        [classItem.id]: (classCounts[classItem.id] || 0) + 1
      });
    } catch (err) {
      Alert.alert(
        'Enrollment Failed',
        'We encountered a problem while trying to enroll. Please try again later.',
      );
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingClasses = classes
    .filter(item => {
      const startDateObj = item.start
        ? new Date(item.start.seconds ? item.start.seconds * 1000 : item.start)
        : null;
      if (!startDateObj || startDateObj < today) return false;

      if (filterClassId && !item.id.toLowerCase().includes(filterClassId.trim().toLowerCase())) return false;

      if (filterSubject && classSubjects[item.id]) {
        const subjName = subjectOptions.find(s => s.id === filterSubject)?.name;
        if (!subjName || classSubjects[item.id] !== subjName) return false;
      }

      if (filterTeacher && classTeachers[item.id] && classTeachers[item.id] !== teacherOptions.find(t => t.id === filterTeacher)?.name) return false;

      return true;
    })
    .sort((a, b) => {
      const aDate = a.start ? new Date(a.start.seconds ? a.start.seconds * 1000 : a.start) : 0;
      const bDate = b.start ? new Date(b.start.seconds ? b.start.seconds * 1000 : b.start) : 0;
      return aDate - bDate;
    });

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.title}>Available Classes</Text>
          <View style={{ alignItems: 'flex-end', marginBottom: 12 }}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('StudentEnrollEdit')}
            >
              <Text style={styles.actionText}>Edit Enrollments</Text>
            </TouchableOpacity>
          </View>
        </View>

        <StudentClassFilters
          filtersVisible={filtersVisible}
          setFiltersVisible={setFiltersVisible}
          filterClassId={filterClassId}
          setFilterClassId={setFilterClassId}
          filterSubject={filterSubject}
          setFilterSubject={setFilterSubject}
          filterTeacher={filterTeacher}
          setFilterTeacher={setFilterTeacher}
          subjectOptions={subjectOptions}
          teacherOptions={teacherOptions}
          styles={styles}
        />

        {upcomingClasses.length === 0 ? (
          <Text style={{ marginTop: 20 }}>No classes available.</Text>
        ) : (
          <FlatList
            data={upcomingClasses}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const startDateObj = item.start
                ? new Date(item.start.seconds ? item.start.seconds * 1000 : item.start)
                : null;
              const endDateObj = item.end
                ? new Date(item.end.seconds ? item.end.seconds * 1000 : item.end)
                : null;
              const enrolledCount = classCounts[item.id] || 0;
              const limit = item.peopleLimit ?? item.limit ?? Infinity;
              const isFull = enrolledCount >= limit;
              const alreadyEnrolled = enrolledClassIds.includes(item.id);
              const isPast = startDateObj && startDateObj < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <StudentClassCard
                  item={item}
                  classSubjects={classSubjects}
                  classTeachers={classTeachers}
                  classCounts={classCounts}
                  enrolledClassIds={enrolledClassIds}
                  handleEnroll={(classItem) => {
                    Alert.alert(
                      'Confirm Enrollment',
                      `Do you want to enroll in ${classSubjects[item.id] || 'this class'}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Enroll', style: 'default', onPress: () => handleEnroll(classItem) }
                      ]
                    );
                  }}
                  styles={styles}
                  isPast={isPast}
                  isFull={isFull}
                  alreadyEnrolled={alreadyEnrolled}
                  limit={limit}
                  enrolledCount={enrolledCount}
                  startDateObj={startDateObj}
                  endDateObj={endDateObj}
                />
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: '#fff', flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginVertical: 16 },
  enrollmentCard: { backgroundColor: '#f2f6fc', borderRadius: 10, padding: 16, marginBottom: 16 },
  classTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  classInfo: { fontSize: 14, color: '#555', marginBottom: 4 },
  editButton: { backgroundColor: '#5996b5', padding: 10, borderRadius: 6 },
  actionText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  filterBox: { backgroundColor: '#eaf6fb', borderRadius: 8, padding: 12, marginBottom: 16, width: '100%' },
  filterLabel: { fontWeight: 'bold', marginBottom: 4, marginTop: 8 },
  input: { borderColor: '#ccc', borderWidth: 1, borderRadius: 6, padding: 8, marginBottom: 4, backgroundColor: '#fff' },
  teacherButton: { backgroundColor: '#f0f0f0', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ccc' },
  teacherButtonSelected: { backgroundColor: '#5bc2e5', borderColor: '#4ca3d8' },
  teacherButtonText: { color: '#333', fontWeight: '500' },
  teacherButtonTextSelected: { color: '#fff', fontWeight: 'bold' },
});