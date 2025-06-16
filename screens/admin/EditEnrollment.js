import React, { useState, useCallback } from 'react';
import { View, Text, Alert, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { doc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

export default function EditEnrollment({ route, navigation }) {
  const { studentId } = route.params;
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // enrollments for this student
  useFocusEffect(
    useCallback(() => {
      const fetchEnrollments = async () => {
        setLoading(true);
        try {
          const snapshot = await getDocs(collection(db, 'enrolment'));
          const studentEnrollments = [];
          for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            // check if this enrollment is for the current student
            let enrolledStudentId = data.student?.id || (typeof data.student === 'string' ? data.student.split('/').pop() : null);
            if (enrolledStudentId === studentId) {
              // class info
              let classId = data.class?.id || (typeof data.class === 'string' ? data.class.split('/').pop() : null);
              let classData = null;
              let subjectName = '';
              let teacherName = '';
              if (classId) {
                const classSnap = await getDoc(doc(db, 'classes', classId));
                if (classSnap.exists()) {
                  classData = { id: classId, ...classSnap.data() };
                  // subject name
                  let subjectId = classData.subject?.id || null; // no string check needed
                  if (subjectId) {
                    const subjectSnap = await getDoc(doc(db, 'subjects', subjectId));
                    if (subjectSnap.exists()) {
                      subjectName = subjectSnap.data().name || subjectId;
                    }
                  }

                  // teacher name
                  let teacherId = classData.professor?.id || null; // no string check needed
                  if (teacherId) {
                    const teacherSnap = await getDoc(doc(db, 'users', teacherId));
                    if (teacherSnap.exists()) {
                      teacherName = teacherSnap.data().name || teacherId;
                    }
                  }
                }
              }
              studentEnrollments.push({
                id: docSnap.id,
                classId,
                classData,
                subjectName,
                teacherName,
              });
            }
          }
          setEnrollments(studentEnrollments);
        } catch (err) {
          Alert.alert(
            'Failed to Load Enrollments',
            'There was an issue retrieving your enrollment information. Please check your connection and try again.',
          );
        }
        setLoading(false);
      };
      fetchEnrollments();
    }, [studentId]));

  const handleDelete = async (enrollmentId) => {
    Alert.alert(
      'Confirm Removal',
      'Are you sure you want to remove this enrollment? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await deleteDoc(doc(db, 'enrolment', enrollmentId));
              setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
              Alert.alert('Enrollment Removed', 'The enrollment has been successfully deleted.');
            } catch (err) {
              Alert.alert(
                'Deletion Failed',
                'There was a problem removing the enrollment. Please try again later.'
              );
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <Text style={styles.title}>Edit Enrollments</Text>
        {enrollments.length === 0 ? (
          <Text style={{ marginTop: 20 }}>No enrollments found for this student.</Text>
        ) : (
          <FlatList
            data={enrollments}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const startDateObj = item.classData?.start
                ? new Date(item.classData.start.seconds ? item.classData.start.seconds * 1000 : item.classData.start)
                : null;
              const endDateObj = item.classData?.end
                ? new Date(item.classData.end.seconds ? item.classData.end.seconds * 1000 : item.classData.end)
                : null;
              const date = startDateObj ? startDateObj.toLocaleDateString() : '';
              const startTime = startDateObj ? startDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              const endTime = endDateObj ? endDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

              return (
                <View style={styles.enrollmentCard}>
                  <Text style={styles.classTitle}>
                    {item.subjectName || 'Unknown Subject'} - {item.classData?.classType || ''}
                  </Text>
                  <Text style={styles.classInfo}>
                    Teacher: {item.teacherName || 'Unknown'}
                  </Text>
                  <Text style={styles.classInfo}>
                    Date: {date}
                  </Text>
                  <Text style={styles.classInfo}>
                    Start Time: {startTime}
                  </Text>
                  <Text style={styles.classInfo}>
                    End Time: {endTime}
                  </Text>
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                      <Text style={styles.actionText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}
        <TouchableOpacity onPress={() => navigation.navigate('EnrollStudents')} style={styles.backButton}>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  enrollmentCard: { backgroundColor: '#f2f6fc', borderRadius: 10, padding: 16, marginBottom: 16, borderColor: '#5996b5', borderWidth: 1 },
  classTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  classInfo: { fontSize: 14, color: '#555', marginBottom: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  deleteBtn: { backgroundColor: '#FF5252', padding: 8, borderRadius: 6 },
  actionText: { color: '#fff', fontWeight: 'bold' },
  backButton: { backgroundColor: '#5996b5', padding: 8, borderRadius: 6, marginBottom: 8, alignContent: 'center', alignItems: 'center' },
});