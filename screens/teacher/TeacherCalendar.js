import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { collection, getDocs, getDoc, doc as firestoreDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

const TeacherCalendar = () => {
  const [markedDates, setMarkedDates] = useState({});
  const [classesByDate, setClassesByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [expandedClassId, setExpandedClassId] = useState(null);

  const userId = getAuth().currentUser?.uid;
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const fetchClasses = async () => {
        const snapshot = await getDocs(collection(db, 'classes'));
        const dateMap = {};
        const marks = {};

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();

          if (!data.professor?.id || data.professor.id !== userId) continue;

          const start = data.start.toDate();
          const end = data.end.toDate();
          const dateStr = start.toISOString().split('T')[0];

          let subjectName = 'Unknown';
          try {
            if (data.subject?.id) {
              const subjDoc = await getDoc(data.subject);
              if (subjDoc.exists()) {
                subjectName = subjDoc.data().name;
              }
            }
          } catch (err) {
            Alert.alert(
              'Error',
              'There was a problem loading the subject information. Please try again later.'
            );
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
    }, [userId]));

  const handleDelete = async (classId) => {
    Alert.alert(
      'Delete Class',
      'Are you sure you want to delete this class?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(firestoreDoc(db, 'classes', classId));
              setClassesByDate(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(date => {
                  updated[date] = updated[date].filter(cls => cls.id !== classId);
                });
                return updated;
              });
            } catch (err) {
              Alert.alert('Error', 'Could not delete class.');
            }
          }
        }
      ]
    );
  };

  const renderClassItem = ({ item }) => {
    const isExpanded = expandedClassId === item.id;
    return (
      <View style={styles.classItem}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setExpandedClassId(isExpanded ? null : item.id)}
        >
          <Text style={styles.classText}>Subject: {item.subjectName}</Text>
          <Text style={styles.classText}>Type: {item.classType}</Text>
          <Text style={styles.classText}>Time: {item.start} - {item.end}</Text>
          {item.additionalNotes ? <Text style={styles.classNote}>Note: {item.additionalNotes}</Text> : null}
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('TeacherEditClass', { classId: item.id })}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

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
    backgroundColor: '#ffffff',
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
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#22C55E',
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    padding: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TeacherCalendar;
