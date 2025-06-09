import React from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert } from 'react-native';

export default function ClassList({
  classes,
  classIdFilter,
  setClassIdFilter,
  loadingClasses,
  classSubjects,
  classTeachers,
  classCounts,
  selectedStudent,
  handleEnroll,
  setSelectedStudent,
  styles
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>
        Select a class to enroll {selectedStudent.name}:
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Search by Class ID"
        value={classIdFilter}
        onChangeText={setClassIdFilter}
      />
      {loadingClasses ? (
        <Text>Loading classes...</Text>
      ) : (
        <FlatList
          data={classes.filter(cls =>
            classIdFilter.trim() === '' ||
            cls.id.toLowerCase().includes(classIdFilter.trim().toLowerCase())
          )}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const startDateObj = item.start
              ? new Date(item.start.seconds ? item.start.seconds * 1000 : item.start)
              : null;
            const endDateObj = item.end
              ? new Date(item.end.seconds ? item.end.seconds * 1000 : item.end)
              : null;
            const date = startDateObj ? startDateObj.toLocaleDateString() : '';
            const startTime = startDateObj ? startDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            const endTime = endDateObj ? endDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            const enrolledCount = classCounts[item.id] || 0;
            const limit = item.peopleLimit ?? item.limit ?? Infinity;
            const isFull = enrolledCount >= limit;

            return (
              <TouchableOpacity
                style={[
                  styles.classOption,
                  isFull && { opacity: 0.5 }
                ]}
                disabled={isFull}
                onPress={() => {
                  if (isFull) return;
                  Alert.alert(
                    'Confirm Enrollment',
                    `Enroll ${selectedStudent.name} in ${classSubjects[item.id] || 'this class'}?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Enroll', style: 'default', onPress: () => handleEnroll(selectedStudent, item) }
                    ]
                  );
                }}
              >
                <Text style={{ fontWeight: 'bold' }}>
                  {classSubjects[item.id] || 'Loading...'} - {item.classType}
                </Text>
                <Text>
                  Teacher: {classTeachers[item.id] || 'Loading...'}
                </Text>
                <Text>
                  Date: {date}
                </Text>
                <Text>
                  Time: {startTime} - {endTime}
                </Text>
                <Text>
                  Enrolled: {enrolledCount} / {limit === Infinity ? 'N/A' : limit}
                  {isFull ? ' (Full)' : ''}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
      <Button title="Back to Students" onPress={() => setSelectedStudent(null)} />
    </View>
  );
}