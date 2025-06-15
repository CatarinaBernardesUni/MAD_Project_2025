import React from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
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
      <Text style={{ fontWeight: 'bold', fontSize: 14 }}>Filters</Text>
      <TextInput
        style={styles.input}
        placeholder="Student ID"
        value={studentIdFilter}
        onChangeText={setStudentIdFilter}
      />
      <View style={styles.filtersRow}>
        <TouchableOpacity style={styles.filterButton} onPress={() => {
          const newSortOrder = !sortAlphabetically;
          setSortAlphabetically(newSortOrder);
          applyFilters(newSortOrder);
        }}>
          <Text>Alphabetical Order</Text>
          <Text>{sortAlphabetically ? '▼' : '▲'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={applyFilters}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Search</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredStudents}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </>
  );
}