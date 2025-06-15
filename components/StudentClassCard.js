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