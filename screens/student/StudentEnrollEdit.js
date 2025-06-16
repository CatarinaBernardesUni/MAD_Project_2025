import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';

export default function StudentEnrollEdit({ navigation }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const studentId = auth.currentUser?.uid;

  useEffect(() => {
    if (!studentId) return;
    const fetchEnrollments = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'enrolment'));
        const studentEnrollments = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          let enrolledStudentId = data.student?.id || (typeof data.student === 'string' ? data.student.split('/').pop() : null);
          if (enrolledStudentId === studentId) {
            let classId = data.class?.id || (typeof data.class === 'string' ? data.class.split('/').pop() : null);
            let classData = null;
            let subjectName = '';
            let teacherName = '';
            let shouldDelete = false;

            if (classId) {
              const classSnap = await getDoc(doc(db, 'classes', classId));
              if (classSnap.exists()) {
                classData = { id: classId, ...classSnap.data() };
                let subjectId = classData.subject?.id || (typeof classData.subject === 'string' ? classData.subject.split('/').pop() : null);
                if (subjectId) {
                  const subjectSnap = await getDoc(doc(db, 'subjects', subjectId));
                  if (subjectSnap.exists()) {
                    subjectName = subjectSnap.data().name || subjectId;
                  }
                }
                let teacherId = classData.professor?.id || (typeof classData.professor === 'string' ? classData.professor.split('/').pop() : null);
                if (teacherId) {
                  const teacherSnap = await getDoc(doc(db, 'users', teacherId));
                  if (teacherSnap.exists()) {
                    teacherName = teacherSnap.data().name || teacherId;
                  }
                }
                const endDate = classData.end
                  ? new Date(classData.end.seconds ? classData.end.seconds * 1000 : classData.end)
                  : null;
                if (endDate && endDate < today) {
                  shouldDelete = true;
                }
              }
            }
            if (shouldDelete && docSnap.id) {
              await deleteDoc(doc(db, 'enrolment', docSnap.id));
              continue;
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
        studentEnrollments.sort((a, b) => {
          const aDate = a.classData?.start ? new Date(a.classData.start.seconds ? a.classData.start.seconds * 1000 : a.classData.start) : 0;
          const bDate = b.classData?.start ? new Date(b.classData.start.seconds ? b.classData.start.seconds * 1000 : b.classData.start) : 0;
          return aDate - bDate;
        });
        setEnrollments(studentEnrollments);
      } catch (err) {
        Alert.alert('Error loading enrollments');
      }
      setLoading(false);
    };
    fetchEnrollments();
  }, [studentId]);

  const handleDelete = async (enrollmentId) => {
    Alert.alert(
      'Remove Enrollment',
      'Are you sure you want to remove this enrollment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await deleteDoc(doc(db, 'enrolment', enrollmentId));
              setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
              Alert.alert('Enrollment removed');
            } catch (err) {
              Alert.alert('Error removing enrollment');
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
        <Text style={styles.title}>My Enrollments</Text>
        {enrollments.length === 0 ? (
          <Text style={{ marginTop: 20 }}>No enrollments found.</Text>
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
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                      <Text style={styles.actionText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}
        <TouchableOpacity
          onPress={() => navigation.navigate('StudentEnroll')}
          style={{
            backgroundColor: '#5996b5',
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 6,
            alignItems: 'center',
            marginBottom: 8
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  enrollmentCard: { backgroundColor: '#f2f6fc', borderRadius: 10, padding: 16, marginBottom: 16 },
  classTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  classInfo: { fontSize: 14, color: '#555', marginBottom: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  deleteButton: { backgroundColor: '#FF5252', padding: 8, borderRadius: 6 },
  actionText: { color: '#fff', fontWeight: 'bold' },
});