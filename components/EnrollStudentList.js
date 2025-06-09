import React from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, FlatList } from 'react-native';
import StudentEnrollCard from './StudentEnrollCard';

export default function StudentList({
  students,
  studentIdFilter,
  setStudentIdFilter,
  sortAlphabetically,
  setSortAlphabetically,
  applyFilters,
  filteredStudents,
  onSelectStudent,
  navigation,
  styles
}) {
  const renderItem = ({ item }) => (
    <StudentEnrollCard
      student={item}
      onEdit={(student) => navigation.navigate('EditEnrollment', { studentId: student.id })}
      onSelect={onSelectStudent}
    />
  );

  return (
    <>
      <Text>Filters</Text>
      <TextInput
        style={styles.input}
        placeholder="Student ID"
        value={studentIdFilter}
        onChangeText={setStudentIdFilter}
      />
      <View style={styles.filtersRow}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setSortAlphabetically(!sortAlphabetically)}>
          <Text>Alphabetical Order</Text>
          <Text>{sortAlphabetically ? '▼' : '▲'}</Text>
        </TouchableOpacity>
        <Button title="Search" onPress={applyFilters} />
      </View>
      <FlatList
        data={filteredStudents}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </>
  );
}