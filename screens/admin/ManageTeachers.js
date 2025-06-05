import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function AdminManageTeachers({ navigation }) {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [teacherIdFilter, setTeacherIdFilter] = useState('');
  const [sortAlphabetically, setSortAlphabetically] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

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
    if (sortAlphabetically) {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    setFilteredTeachers(filtered);
  };

  const deleteTeacher = async (teacherId) => {
    try {
      await deleteDoc(doc(db, 'users', teacherId));
      fetchTeachers(); // refresh list
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.teacherCard}>
      <Text>ID: {item.id}</Text>
      <Text>Name: {item.name}</Text>
      <Text>Email: {item.email}</Text>
      <Text>Subjects: Programming</Text> {/* CHANGE THIS TO ACCTUALLY FETCH THE TEACHER'S SUBJECTS */}

      <View style={styles.buttonRow}>
        <Button title="Edit" onPress={() => navigation.navigate('EditTeacher', { teacher: item })} />
        <Button title="Delete" color="red" onPress={() => deleteTeacher(item.id)} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Teachers</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTeacher')}
      >
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
        <Text>Alphabetical Order</Text>
        <TouchableOpacity onPress={() => setSortAlphabetically(!sortAlphabetically)}>
          <Text>{sortAlphabetically ? '▼' : '▲'}</Text>
        </TouchableOpacity>
        <Button title="Apply Filters" onPress={applyFilters} />
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
  filtersRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  teacherCard: { padding: 12, borderWidth: 1, borderColor: '#ccc', marginBottom: 8, borderRadius: 6 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }
});