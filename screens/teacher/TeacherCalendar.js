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
        markedDates={{
          ...markedDates,
          ...(selectedDate && { [selectedDate]: { ...markedDates[selectedDate], selected: true, selectedColor: '#00adf5' } })
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
    padding: 10,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  classItem: {
    backgroundColor: '#e6f0ff',
    padding: 10,
    marginBottom: 8,
    borderRadius: 10,
  },
  classText: {
    fontSize: 14,
  },
  classNote: {
    fontStyle: 'italic',
    color: '#555',
  },
});

export default TeacherCalendar;
