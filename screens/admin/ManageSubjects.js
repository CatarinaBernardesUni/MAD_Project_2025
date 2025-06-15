import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SubjectCard from '../../components/SubjectCard';

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchSubjects();
    }, [])
  );

  const fetchSubjects = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'subjects'));
      const subjectList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubjects(subjectList);
    } catch (error) {
      Alert.alert('Error', 'Unable to load subjects. Please try again later.');
    }
  };

  const addSubject = async () => {
    if (!newSubjectName.trim()) return;
    try {
      await addDoc(collection(db, 'subjects'), { name: newSubjectName.trim() });
      setNewSubjectName('');
      fetchSubjects();
    } catch (error) {
      Alert.alert('Error', 'Failed to add subject. Please try again.');
    }
  };

  const deleteSubject = async (subjectId) => {
    try {
      await deleteDoc(doc(db, 'subjects', subjectId));
      fetchSubjects();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete subject. Please try again.');
    }
  };

  const startEditing = (subject) => {
    setEditingId(subject.id);
    setEditingName(subject.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = async () => {
    if (!editingName.trim()) {
      Alert.alert('Validation', 'Subject name cannot be empty.');
      return;
    }
    try {
      const subjectRef = doc(db, 'subjects', editingId);
      await updateDoc(subjectRef, { name: editingName.trim() });
      cancelEdit();
      fetchSubjects();
    } catch (error) {
      Alert.alert('Error', 'Failed to update subject. Please try again.');
    }
  };

  const renderItem = ({ item }) => {
    if (editingId === item.id) {
      // Show editing UI instead of SubjectCard
      return (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            value={editingName}
            onChangeText={setEditingName}
            autoFocus
          />
          <View style={styles.editButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <SubjectCard
        subject={item}
        onEdit={startEditing}
        onDelete={() =>
          Alert.alert(
            'Confirm Deletion',
            `Are you sure you want to delete "${item.name}"?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteSubject(item.id) },
            ]
          )
        }
      />
    );
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <Text style={styles.header}>Manage Subjects</Text>

        <View style={styles.addSection}>
          <TextInput
            style={styles.input}
            placeholder="New Subject Name"
            value={newSubjectName}
            onChangeText={setNewSubjectName}
          />
          <TouchableOpacity style={styles.addButton} onPress={addSubject}>
            <Text style={styles.buttonText}>Add Subject</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={subjects}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No subjects available.</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, backgroundColor: '#f0f4f8' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  addSection: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    marginRight: 8,
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#5996b5'
  },
  editContainer: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    elevation: 2,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#808080',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addButton: {
  backgroundColor: '#5996b5',
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 8,
  alignItems: 'center',
},
});
