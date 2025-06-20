import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import * as Progress from 'react-native-progress';
import BlockBar from '../../components/BlockBar';
import { collection, query, where, getDocs, getDoc, doc} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';


const StudentAttendance = () => {
  const [presentCount, setPresentCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [subjectRefs, setSubjectRefs] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [classTypes, setClassTypes] = useState([]);
  const [selectedClassType, setSelectedClassType] = useState('');
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [filteredPresent, setFilteredPresent] = useState(0);

  useEffect(() => {
  const fetchAttendance = async () => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    const enrolmentQuery = query(collection(db, 'enrolment'), where('student', '==', userRef));
    const snapshot = await getDocs(enrolmentQuery);

    let present = 0;
    let total = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (typeof data.attendance === 'boolean') {
        total += 1;
        if (data.attendance === true) {
          present += 1;
        }
      }
    });

    setPresentCount(present);
    setTotalCount(total);
  };

  fetchAttendance();
}, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userRef = doc(db, 'users', userId);
      const enrolmentQuery = query(collection(db, 'enrolment'), where('student', '==', userRef));
      const enrolmentsSnap = await getDocs(enrolmentQuery);

      const subjectIds = new Set();

      for (const enrolDoc of enrolmentsSnap.docs) {
        const enrolData = enrolDoc.data();
        if (enrolData.class) {
          const classSnap = await getDoc(enrolData.class);
          if (classSnap.exists()) {
            const classData = classSnap.data();
            const subjectRef = classData.subject;
            if (subjectRef) {
              subjectIds.add(subjectRef.id);
            }
          }
        }
      }

      const subjectsSnap = await getDocs(collection(db, 'subjects'));
      const allSubjects = subjectsSnap.docs.map(d => ({
        id: d.id,
        name: d.data().name,
      }));

      const filtered = allSubjects.filter(s => subjectIds.has(s.id));
      setSubjectRefs(filtered);
      setSelectedSubject(filtered.length > 0 ? filtered[0].id : '');
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchClassTypes = async () => {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userRef = doc(db, 'users', userId);
      const enrolmentQuery = query(collection(db, 'enrolment'), where('student', '==', userRef));
      const snapshot = await getDocs(enrolmentQuery);

      const types = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.class) {
          const classSnap = await getDoc(data.class);
          if (classSnap.exists()) {
            const classData = classSnap.data();
            const type = classData.classType;
            if (type && !types.includes(type)) {
              types.push(type);
            }
          }
        }
      }
      setClassTypes(types);
      setSelectedClassType(types.length > 0 ? types[0] : '');
    };
    fetchClassTypes();
  }, []);

  useEffect(() => {
    const fetchFilteredAttendance = async () => {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (!userId || !selectedSubject) {
        setFilteredTotal(0);
        setFilteredPresent(0);
        return;
      }

      const userRef = doc(db, 'users', userId);
      const enrolmentQuery = query(collection(db, 'enrolment'), where('student', '==', userRef));
      const snapshot = await getDocs(enrolmentQuery);

      let present = 0;
      let total = 0;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.class) {
          const classSnap = await getDoc(data.class);
          if (classSnap.exists()) {
            const classData = classSnap.data();
            const subjectRef = classData.subject;
            const classType = classData.classType;

            const matchSubject = subjectRef?.id === selectedSubject;
            const matchType = selectedClassType ? classType === selectedClassType : true;

            if (matchSubject && matchType && typeof data.attendance === 'boolean') {
              total += 1;
              if (data.attendance === true) {
                present += 1;
              }
            }
          }
        }
      }
      setFilteredTotal(total);
      setFilteredPresent(present);
    };

    fetchFilteredAttendance();
  }, [selectedSubject, selectedClassType]);

  const attendanceRate = totalCount > 0 ? presentCount / totalCount : 0;
  const filteredPercentage = filteredTotal > 0 ? ((filteredPresent / filteredTotal) * 100).toFixed(0): 'N/A';

  return (
    <ScrollView contentContainerStyle={{ ...styles.container, flexGrow: 1 }}>
      <Text style={styles.title}> Attendance Summary</Text>
      <Text style={styles.text}> Overall Attendance:</Text>
      <View style={styles.circleContainer}>
        <Progress.Circle
            size={220}
            progress={attendanceRate}
            thickness={22}
            showsText={true}
            formatText={() => `${(attendanceRate * 100).toFixed(0)}%`}
            color="#4A90E2"
            unfilledColor="#E5E5E5"
            borderWidth={0}
            textStyle={{ fontSize: 32, fontWeight: 'bold', color: '#4A90E2' }}
          />
        </View>
        <View style={styles.legend}>
          <View style={[styles.colorBox, { backgroundColor: '#4A90E2' }]} />
          <Text style={styles.legendText}>You attended {(attendanceRate * 100).toFixed(0)}% of your classes</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text>Total Classes: {totalCount}</Text>
          <Text>Attended: {presentCount}</Text>
          <Text>Missed: {totalCount - presentCount}</Text>
        </View>
        <Text style={styles.text}> Attendance Overview by Subject:</Text>
        <Text style={styles.pickerLabel}>Subject:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedSubject}
            onValueChange={setSelectedSubject}
            style={styles.picker}
          >
            {subjectRefs.map((subj, idx) => (
              <Picker.Item key={idx} label={subj.name} value={subj.id} />
            ))}
          </Picker>
        </View>
        <Text style={styles.pickerLabel}>Class Type (optional):</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedClassType}
            onValueChange={setSelectedClassType}
            style={styles.picker}
          >
            {classTypes.map((type, idx) => (
              <Picker.Item key={idx} label={type} value={type} />
            ))}
          </Picker>
        </View>
        <View style={styles.summaryCard}>
          <Text>Total Classes: {filteredTotal}</Text>
          <Text>Attended: {filteredPresent}</Text>
          <Text>Missed: {filteredTotal - filteredPresent}</Text>
          <Text>Average Attendance: {filteredPercentage === 'N/A' ? 'N/A' : `${filteredPercentage}%`}</Text>
          <BlockBar percentage={filteredPercentage === 'N/A' ? 0 : Number(filteredPercentage)} color="#4A90E2" />
        </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 15, 
    backgroundColor: '#F2F6FC', 
    paddingBottom: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    marginVertical: 16,
  },
  circleContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 15,
    color: '#444',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    marginBottom: 16,
  },
  picker: {
    width: '100%',
  },
  pickerLabel: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 6,
    marginLeft: 4,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    marginBottom: 16,
    width: '100%',
    elevation: 2
  },
});

export default StudentAttendance;