import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function StudentClassCard({
  item,
  classSubjects,
  classTeachers,
  classCounts,
  enrolledClassIds,
  handleEnroll,
  styles,
  isPast,
  isFull,
  alreadyEnrolled,
  limit,
  enrolledCount,
  startDateObj,
  endDateObj,
}) {
  const date = startDateObj ? startDateObj.toLocaleDateString() : '';
  const startTime = startDateObj ? startDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const endTime = endDateObj ? endDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <TouchableOpacity
      style={[
        styles.enrollmentCard,
        (isFull || alreadyEnrolled || isPast) && { opacity: 0.5 }
      ]}
      disabled={isFull || alreadyEnrolled || isPast}
      onPress={() => {
        if (isPast) return;
        handleEnroll(item);
      }}
    >
      <Text style={styles.classTitle}>
        {classSubjects[item.id] || 'Loading...'} - {item.classType || ''}
      </Text>
      <Text style={styles.classInfo}>
        Teacher: {classTeachers[item.id] || 'Loading...'}
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
      <Text style={styles.classInfo}>
        Enrolled: {enrolledCount} / {limit === Infinity ? 'N/A' : limit}
        {isFull ? ' (Full)' : alreadyEnrolled ? ' (Already Enrolled)' : ''}
      </Text>
      {isPast && (
        <Text style={[styles.classInfo, { color: '#FF5252' }]}>
          This class has already started.
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = {
  enrollmentCard: { backgroundColor: '#f9fbfd', borderRadius: 12, padding: 18, marginBottom: 16, shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3, borderWidth: 1,
      borderColor: '#e0e6ed', width: '100%' },
  classTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 6, color: '#1976d2' },
  classInfo: { fontSize: 15, color: '#444', marginBottom: 2 },
};