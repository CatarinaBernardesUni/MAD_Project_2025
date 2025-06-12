import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';

const TeacherCalendar = () => {
  const [markedDates, setMarkedDates] = useState({});
  const [classesByDate, setClassesByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  const userId = getAuth().currentUser?.uid;

  useEffect(() => {
    const fetchClasses = async () => {
      const snapshot = await getDocs(collection(db, 'classes'));
      const dateMap = {};
      const marks = {};

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        if (!data.professor || !data.professor.endsWith(userId)) continue;

        const start = data.start.toDate();
        const end = data.end.toDate();
        const dateStr = start.toISOString().split('T')[0];

        let subjectName = 'Unknown';
        try {
          if (typeof data.subject === 'string') {
            const subjectRef = doc(db, data.subject);
            const subjDoc = await getDoc(subjectRef);
            if (subjDoc.exists()) {
              subjectName = subjDoc.data().name;
            }
          } else if (typeof data.subject === 'object' && 'path' in data.subject) {
            const subjDoc = await getDoc(data.subject);
            if (subjDoc.exists()) {
              subjectName = subjDoc.data().name;
            }
          }
        } catch (err) {
          console.warn('Error fetching subject:', err);
        }

        if (!dateMap[dateStr]) {
          dateMap[dateStr] = [];
          marks[dateStr] = { marked: true, dotColor: '#007AFF' };
        }

        dateMap[dateStr].push({
          id: docSnap.id,
          subjectName,
          classType: data.classType,
          start: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          end: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          additionalNotes: data.additionalNotes || '',
        });
      }

      setMarkedDates(marks);
      setClassesByDate(dateMap);
    };

    fetchClasses();
  }, [userId]);

  const renderClassItem = ({ item }) => (
    <View style={styles.classItem}>
      <Text style={styles.classText}>Subject: {item.subjectName}</Text>
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
        {selectedDate ? `Classes on ${selectedDate}` : 'Select a date to view classes'}
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

export default TeacherCalendar;
