import React, { useEffect, useState } from 'react';
import {View, Text, FlatList, Switch, Button, Alert, ActivityIndicator, StyleSheet} from 'react-native';
import {doc, getDoc, getDocs, query, where, collection, writeBatch} from 'firebase/firestore';
import { db } from '../../firebase'; 

export default function TeacherAttendanceScreen({ route }) {
    const { selectedClassId: classId } = route.params;
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

  useEffect(() => {
    const loadData = async () => {
      try {
        const classRef = doc(db, 'classes', classId);
        console.log('Class ref path2:', classRef.path);
        const enrolSnap = await getDocs(
          query(collection(db, 'enrolment'), where('class', '==', classRef))
        );
        // console.log('Total enrolments:', enrolSnap.size);

        const enrolmentList = [];
        enrolSnap.forEach((docSnap) => {
          const data = docSnap.data();
          console.log(docSnap.id, 'class ref path:', data.class?.path);
          enrolmentList.push({
            enrolmentId: docSnap.id,
            studentRef: data.student,
            isPresent: data.attendance?.[today] ?? false,
          });
        });

        const studentDocs = await Promise.all(
          enrolmentList.map((e) => getDoc(e.studentRef))
        );
        const studentsWithNames = enrolmentList.map((e, i) => ({
          enrolmentId: e.enrolmentId,
          name: studentDocs[i].data()?.name || 'Unnamed',
          isPresent: e.isPresent,
        }));

        setStudents(studentsWithNames);
        setLoading(false);
      } catch (err) {
        Alert.alert('Error loading data', err.message);
        setLoading(false);
      }
    };

    loadData();
  }, [classId]);

  const togglePresence = (id, newVal) => {
    setStudents((prev) =>
      prev.map((stu) =>
        stu.enrolmentId === id ? { ...stu, isPresent: newVal } : stu
      )
    );
  };

  const submitAttendance = async () => {
    try {
      const batch = writeBatch(db);
      students.forEach((stu) => {
        const enrolRef = doc(db, 'enrolment', stu.enrolmentId);
        batch.set(
          enrolRef,
          { attendance: stu.isPresent },
          { merge: true }
        );
      });
      await batch.commit();
      Alert.alert('Attendance saved!');
    } catch (err) {
      Alert.alert('Error saving attendance', err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mark Attendance for {today}</Text>

      <FlatList
        data={students}
        keyExtractor={(item) => item.enrolmentId}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Switch
              value={item.isPresent}
              onValueChange={(val) => togglePresence(item.enrolmentId, val)}
            />
          </View>
        )}
      />

      <View style={styles.buttonContainer}>
        <Button title="Submit Attendance" onPress={submitAttendance} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  name: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
    paddingBottom: 40,
  },
});
