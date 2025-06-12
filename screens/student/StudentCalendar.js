import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { collection, getDocs, getDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';

const StudentCalendar = () => {
  const [markedDates, setMarkedDates] = useState({});
  const [classesByDate, setClassesByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  const userId = getAuth().currentUser?.uid;

  useEffect(() => {
    const fetchEnrolledClasses = async () => {
      const enrolRef = collection(db, 'enrolment');
      const q = query(enrolRef, where('student', '==', doc(db, 'users', userId)));
      const snapshot = await getDocs(q);

      const dateMap = {};
      const marks = {};

      for (const enrollDoc of snapshot.docs) {
        const enrollment = enrollDoc.data();
        const classRef = enrollment.class;
        const classSnap = await getDoc(classRef);

        if (!classSnap.exists()) continue;

        const classData = classSnap.data();

        const start = classData.start.toDate();
        const end = classData.end.toDate();
        const dateStr = start.toISOString().split('T')[0];

        let professorName = 'Unknown';
        try {
          if (typeof classData.professor === 'string') {
            if (classData.professor.includes('/')) {
              // professor is a full path string like 'users/abc123'
              const pathSegments = classData.professor.split('/');
              const profDoc = await getDoc(doc(db, ...pathSegments));
              if (profDoc.exists()) {
                professorName = profDoc.data().name || 'Unknown';
              }
            } else {
              // professor is just an ID, fetch from 'users' collection
              const profDoc = await getDoc(doc(db, 'users', classData.professor));
              if (profDoc.exists()) {
                professorName = profDoc.data().name || 'Unknown';
              }
            }
          }
        } catch (err) {
          console.warn('Error fetching professor:', err);
        }

        let subjectName = 'Unknown';
        try {
          if (typeof classData.subject === 'string') {
            const subjectDoc = await getDoc(doc(db, classData.subject));
            if (subjectDoc.exists()) subjectName = subjectDoc.data().name;
          } else if (typeof classData.subject === 'object') {
            const subjectDoc = await getDoc(classData.subject);
            if (subjectDoc.exists()) subjectName = subjectDoc.data().name;
          }
        } catch (err) {
          console.warn('Error fetching subject:', err);
        }

        if (!dateMap[dateStr]) {
          dateMap[dateStr] = [];
          marks[dateStr] = { marked: true, dotColor: '#16a34a' };
        }

        dateMap[dateStr].push({
          id: classSnap.id,
          subjectName,
          classType: classData.classType,
          start: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          end: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          additionalNotes: classData.additionalNotes || '',
          professorName,
        });
      }

      setMarkedDates(marks);
      setClassesByDate(dateMap);
    };

    if (userId) fetchEnrolledClasses();
  }, [userId]);

  const renderClassItem = ({ item }) => (
    <View style={styles.classItem}>
      <Text style={styles.classText}>Subject: {item.subjectName}</Text>
      <Text style={styles.classText}>Professor: {item.professorName}</Text>
      <Text style={styles.classText}>Type: {item.classType}</Text>
      <Text style={styles.classText}>Time: {item.start} - {item.end}</Text>
      {item.additionalNotes ? <Text style={styles.classNote}>Note: {item.additionalNotes}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <Calendar
        theme={{
          selectedDayBackgroundColor: '#477fd1',
          selectedDayTextColor: '#fff',
          todayTextColor: '#ef4444',
          dayTextColor: '#1e293b',
          textDisabledColor: '#9399a3',
          arrowColor: '#477fd1',
          textDayFontWeight: '500',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 18,
          textMonthFontSize: 24,
          textDayHeaderFontSize: 14,
          monthTextColor: '#1e3a8a',
          backgroundColor: '#f0f4f8',
          calendarBackground: '#f0f4f8',
        }}
        markedDates={{
          ...markedDates,
          ...(selectedDate && {
            [selectedDate]: {
              ...(markedDates[selectedDate] || {}),
              selected: true,
              selectedColor: '#477fd1',
            },
          }),
        }}
        onDayPress={day => setSelectedDate(day.dateString)}
      />
      <Text style={styles.dateHeader}>
        {selectedDate ? `Classes on ${selectedDate}` : 'Select a date to view your classes'}
      </Text>
      <FlatList
        data={selectedDate ? classesByDate[selectedDate] || [] : []}
        keyExtractor={item => item.id}
        renderItem={renderClassItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f4f8',
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2a2a2a',
    marginVertical: 14,
    textAlign: 'center',
  },
  classItem: {
    backgroundColor: '#dbeafe',
    padding: 14,
    marginVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#477fd1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classText: {
    fontSize: 15,
    color: '#000000',
    marginBottom: 4,
  },
  classNote: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#475569',
    marginTop: 4,
  },
});

export default StudentCalendar;
