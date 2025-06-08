import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import StudentCard from '../../components/StudentCard';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function AdminManageStudents({ navigation }) {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentIdFilter, setStudentIdFilter] = useState('');
  const [sortAlphabetically, setSortAlphabetically] = useState(true);

  useFocusEffect(
  useCallback(() => {
    fetchStudents();
  }, [])
);

  useEffect(() => {
    applyFilters();
  }, [sortAlphabetically]);

  const fetchStudents = async () => {
    const q = query(collection(db, 'users'), where('roles', 'array-contains', 'student'));
    const snapshot = await getDocs(q);
    const studentList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setStudents(studentList);
    setFilteredStudents(studentList);
  };

  const applyFilters = () => {
    let filtered = students;
    if (studentIdFilter.trim()) {
      filtered = filtered.filter(t => t.id.includes(studentIdFilter.trim()));
    }
    filtered.sort((a, b) => {
      if (!a.name || !b.name) return 0; 
      return sortAlphabetically
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });
    setFilteredStudents(filtered);
  };

  const deleteStudent = async (studentId) => {
    try {
      await deleteDoc(doc(db, 'users', studentId));
      /*it is deleting from the users but not from the authentication*/
      fetchStudents();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const renderItem = ({ item }) => (
    <StudentCard
      student={item}
      onEdit={(student) => navigation.navigate('EditStudent', { studentId: student.id })}
      onDelete={(student) =>
        Alert.alert(
          'Confirm Deletion',
          `Are you sure you want to block ${student.name || 'this student'}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Block', style: 'destructive', onPress: () => deleteStudent(student.id) },
          ]
        )
      }
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Students</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddStudent')}>
        <Text>Add Student</Text>
      </TouchableOpacity>

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
    </View>
  );
}
const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  addButton: { backgroundColor: '#cde', padding: 8, borderRadius: 6, alignSelf: 'flex-end', marginBottom: 12 },
  input: { borderColor: '#ccc', borderWidth: 1, padding: 8, marginBottom: 12 },
  filtersRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, justifyContent: 'space-between' },
  studentCard: { padding: 12, borderWidth: 1, borderColor: '#ccc', marginBottom: 8, borderRadius: 6 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  filterButton: { flexDirection: 'row', marginLeft: 8, alignItems: 'center', gap: 4 },
});
