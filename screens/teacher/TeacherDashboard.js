import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase';
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import BlockBar from '../../components/BlockBar';

const TeacherDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [subjectRefs, setSubjectRefs] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [summary, setSummary] = useState(null);
  const [generalSummary, setGeneralSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const teacherId = getAuth().currentUser?.uid;

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      if (!teacherId) return;
      const userRef = doc(db, 'users', teacherId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const teacherSubjects = userSnap.data().subjects || [];
        const subjectsSnap = await getDocs(collection(db, 'subjects'));
        const allSubjects = subjectsSnap.docs.map(d => ({
          id: d.id,
          name: d.data().name,
        }));
        const filtered = allSubjects.filter(s => teacherSubjects.includes(s.name));
        setSubjects(filtered.map(s => s.name));
        setSubjectRefs(filtered.map(s => ({ id: s.id, name: s.name })));
        setSelectedSubject(filtered.length > 0 ? filtered[0].id : '');
      }
      setLoading(false);
    };
    fetchSubjects();
  }, [teacherId]);

  useEffect(() => {
    const fetchGeneralSummary = async () => {
      if (!teacherId) {
        setGeneralSummary(null);
        return;
      }
      setLoading(true);

      const professorRef = doc(db, 'users', teacherId);
      const classesSnap = await getDocs(collection(db, 'classes'));
      const classDocs = classesSnap.docs.filter(d => {
        const data = d.data();
        return (data.professor?.id === teacherId) ||
          (typeof data.professor === 'string' && data.professor.endsWith(teacherId));
      });
      const classRefs = classDocs.map(d => d.ref);

      let totalPresences = 0;
      let totalAttendances = 0;
      let totalClasses = classDocs.length;

      if (classRefs.length > 0) {
        const batchSize = 10;
        for (let i = 0; i < classRefs.length; i += batchSize) {
          const batchRefs = classRefs.slice(i, i + batchSize);
          if (batchRefs.length > 0) {
            const enrolSnap = await getDocs(
              query(
                collection(db, 'enrolment'),
                where('class', 'in', batchRefs)
              )
            );
            enrolSnap.forEach(doc => {
              const data = doc.data();
              if (typeof data.attendance === 'boolean') {
                totalAttendances++;
                if (data.attendance) totalPresences++;
              }
            });
          }
        }
      }

      setGeneralSummary({
        totalClasses,
        totalPresences,
        totalAttendances,
        averageAttendance: totalAttendances > 0 ? ((totalPresences / totalAttendances) * 100).toFixed(1) : 'N/A',
      });
      setLoading(false);
    };
    fetchGeneralSummary();
  }, [teacherId]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!selectedSubject || !teacherId) {
        setSummary(null);
        return;
      }
      setLoading(true);

      const professorRef = doc(db, 'users', teacherId);
      const subjectRef = doc(db, 'subjects', selectedSubject);

      const classesSnap = await getDocs(collection(db, 'classes'));
      const classDocs = classesSnap.docs.filter(d => {
        const data = d.data();
        const profMatch = (data.professor?.id === teacherId) ||
          (typeof data.professor === 'string' && data.professor.endsWith(teacherId));
        const subjMatch = (data.subject?.id === selectedSubject) ||
          (typeof data.subject === 'string' && data.subject.endsWith(selectedSubject));
        return profMatch && subjMatch;
      });
      const classRefs = classDocs.map(d => d.ref);


      let totalPresences = 0;
      let totalAttendances = 0;
      let totalClasses = classDocs.length;

      if (classRefs.length > 0) {
        const batchSize = 10;
        for (let i = 0; i < classRefs.length; i += batchSize) {
          const batchRefs = classRefs.slice(i, i + batchSize);
          if (batchRefs.length > 0) {
            const enrolSnap = await getDocs(
              query(
                collection(db, 'enrolment'),
                where('class', 'in', batchRefs)
              )
            );
            enrolSnap.forEach(doc => {
              const data = doc.data();
              if (typeof data.attendance === 'boolean') {
                totalAttendances++;
                if (data.attendance) totalPresences++;
              }
            });
          }
        }
      }

      setSummary({
        totalClasses,
        totalPresences,
        totalAttendances,
        averageAttendance: totalAttendances > 0 ? ((totalPresences / totalAttendances) * 100).toFixed(1) : 'N/A',
      });
      setLoading(false);
    };
    fetchSummary();
  }, [selectedSubject, teacherId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Teacher Dashboard</Text>

      <Text style={styles.subtitle}>Your Subjects:</Text>
      <View style={styles.subjectsRow}>
        {subjectRefs.map(subj => (
          <View key={subj.id} style={styles.subjectCard}>
            <Text style={styles.subjectText}>{subj.name}</Text>
          </View>
        ))}
      </View>

      {generalSummary && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>General Attendance Summary</Text>
          <Text>Total Classes: {generalSummary.totalClasses}</Text>
          <Text>Total Presences Marked: {generalSummary.totalPresences}</Text>
          <Text>Average Attendance: {generalSummary.averageAttendance}%</Text>
          <BlockBar percentage={generalSummary.averageAttendance === 'N/A' ? 0 : Number(generalSummary.averageAttendance)} />
        </View>
      )}

      <Text style={styles.subtitle}>Select Subject for Attendance Summary:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedSubject}
          onValueChange={setSelectedSubject}
          style={styles.picker}
        >
          {subjectRefs.map(subj => (
            <Picker.Item key={subj.id} label={subj.name} value={subj.id} />
          ))}
        </Picker>
      </View>

      {summary && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            Attendance Summary for {subjectRefs.find(s => s.id === selectedSubject)?.name}
          </Text>
          <Text>Total Classes: {summary.totalClasses}</Text>
          <Text>Total Presences Marked: {summary.totalPresences}</Text>
          <Text>Average Attendance: {summary.averageAttendance}%</Text>
          <BlockBar percentage={summary.averageAttendance === 'N/A' ? 0 : Number(summary.averageAttendance)} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F2F6FC', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, color: '#000', fontWeight: 'bold', marginBottom: 10, alignSelf: 'flex-start' },
  subtitle: { fontSize: 18, color: '#4A90E2', fontWeight: 'bold', marginTop: 18, marginBottom: 6 },
  subjectsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  subjectCard: { backgroundColor: '#fff', borderRadius: 8, padding: 10, margin: 4, elevation: 2 },
  subjectText: { fontSize: 16, color: '#333' },
  pickerWrapper: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ccc', width: '100%', marginBottom: 16 },
  picker: { width: '100%' },
  summaryCard: { backgroundColor: '#fff', borderRadius: 10, padding: 18, marginTop: 16, width: '100%', elevation: 2 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
});

export default TeacherDashboard;