import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Dimensions } from 'react-native';
import * as Progress from 'react-native-progress';
import { getFirestore, collection, query, where, getDocs, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#F2F6FC',
  backgroundGradientTo: '#F2F6FC',
  color: (opacity = 1, index) => index === 0 ? '#76c8d6' : '#E5E5E5',
  strokeWidth: 18,
  barPercentage: 1,
  useShadowColorFromDataset: false,
};

const StudentAttendance = () => {
  const [presentCount, setPresentCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [classTypes, setClassTypes] = useState(['Seminar', 'Lecture', 'Workshop', 'Lab']);
  const [selectedClassType, setSelectedClassType] = useState('Seminar');

  useEffect(() => {
  const fetchAttendance = async () => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    const enrolmentRef = collection(db, 'enrolment');
    const enrolmentQuery = query(enrolmentRef, where('student', '==', userRef));

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
    // Buscar as disciplinas do estudante
    const fetchSubjects = async () => {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const studentSubjects = userSnap.data().subjects || [];
        setSubjects(studentSubjects);
        setSelectedSubject(studentSubjects.length > 0 ? studentSubjects[0] : '');
      }
    };
    fetchSubjects();
  }, []);

  const attendanceRate = totalCount > 0 ? presentCount / totalCount : 0;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}> Attendance Summary</Text>
        <Text style={styles.text}> Overall Attendance:</Text>
        <View style={styles.circleContainer}>
          <Progress.Circle
              size={220}
              progress={attendanceRate}
              thickness={22}
              showsText={true}
              formatText={() => `${(attendanceRate * 100).toFixed(0)}%`}
              color="#76c8d6"
              unfilledColor="#E5E5E5"
              borderWidth={0}
              textStyle={{ fontSize: 32, fontWeight: 'bold', color: '#76c8d6' }}
            />
          </View>
          <View style={styles.legend}>
            <View style={[styles.colorBox, { backgroundColor: '#76c8d6' }]} />
            <Text style={styles.legendText}>You attended {(attendanceRate * 100).toFixed(0)}% of your classes</Text>
          </View>
      </View>
      <View style={styles.pickerWrapper}>
        <Text style={styles.pickerLabel}>Subject:</Text>
        <Picker
          selectedValue={selectedSubject}
          onValueChange={setSelectedSubject}
          style={styles.picker}
        >
          {subjects.map((subj, idx) => (
            <Picker.Item key={idx} label={subj} value={subj} />
          ))}
        </Picker>
      </View>

      <View style={styles.pickerWrapper}>
        <Text style={styles.pickerLabel}>Class Type:</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 15, 
    backgroundColor: '#F2F6FC', 
    flex: 1
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  text: {
    fontSize: 16,
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
    marginBottom: 2,
  },
  colorBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 15,
    color: '#444',
  },
  pickerWrapper: { 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    borderWidth: 1, borderColor: '#ccc', width: '100%', marginBottom: 16 },
  picker: { width: '100%' },
  pickerLabel: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: 'bold',
    marginLeft: 8,
},
});

export default StudentAttendance;