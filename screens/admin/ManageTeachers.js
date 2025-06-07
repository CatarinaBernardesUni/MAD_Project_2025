import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import TeacherCard from '../../components/TeacherCard';
import { useFocusEffect } from '@react-navigation/native';

export default function AdminManageTeachers({ navigation }) {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [teacherIdFilter, setTeacherIdFilter] = useState('');
  const [sortAlphabetically, setSortAlphabetically] = useState(true);

  useFocusEffect(
  useCallback(() => {
    fetchTeachers();
  }, [])
);

  useEffect(() => {
    applyFilters();
  }, [sortAlphabetically]);

  const fetchTeachers = async () => {
    const q = query(collection(db, 'users'), where('roles', 'array-contains', 'teacher'));
    const snapshot = await getDocs(q);
    const teacherList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTeachers(teacherList);
    setFilteredTeachers(teacherList);
  };

  const applyFilters = () => {
    let filtered = teachers;
    if (teacherIdFilter.trim()) {
      filtered = filtered.filter(t => t.id.includes(teacherIdFilter.trim()));
    }
    filtered.sort((a, b) => {
      if (!a.name || !b.name) return 0; 
      return sortAlphabetically
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });
    setFilteredTeachers(filtered);
  };

  const deleteTeacher = async (teacherId) => {
    try {
      await deleteDoc(doc(db, 'users', teacherId));
      /*it is deleting from the users but not from the authentication*/
      fetchTeachers();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const renderItem = ({ item }) => (
    <TeacherCard
      teacher={item}
      onEdit={(teacher) => navigation.navigate('EditTeacher', { teacherId: teacher.id })}
      onDelete={(teacher) =>
        Alert.alert(
          'Confirm Deletion',
          `Are you sure you want to delete ${teacher.name || 'this teacher'}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteTeacher(teacher.id) },
          ]
        )
      }
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Teachers</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTeacher')}>
        <Text>Add Teacher</Text>
      </TouchableOpacity>

      <Text>Filters</Text>
      <TextInput
        style={styles.input}
        placeholder="Teacher ID"
        value={teacherIdFilter}
        onChangeText={setTeacherIdFilter}
      />
      <View style={styles.filtersRow}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setSortAlphabetically(!sortAlphabetically)}>
          <Text>Alphabetical Order</Text>
          <Text>{sortAlphabetically ? '▼' : '▲'}</Text>
        </TouchableOpacity>
        <Button title="Search" onPress={applyFilters} />
      </View>

      <FlatList
        data={filteredTeachers}
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
  teacherCard: { padding: 12, borderWidth: 1, borderColor: '#ccc', marginBottom: 8, borderRadius: 6 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  filterButton: { flexDirection: 'row', marginLeft: 8, alignItems: 'center', gap: 4 },
});