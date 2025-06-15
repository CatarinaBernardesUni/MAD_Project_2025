import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ClassTypeCard from '../../components/ClassTypeCard';

export default function ManageClassType() {
  const [classType, setClassType] = useState([]);
  const [newClassTypeName, setnewClassTypeName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchClassType();
    }, [])
  );

  const fetchClassType = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'classType'));
      const classTypeList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClassType(classTypeList);
    } catch (error) {
      console.error('Error fetching classType:', error);
    }
  };

  const addClassType = async () => {
    if (!newClassTypeName.trim()) return;
    try {
      await addDoc(collection(db, 'classType'), { name: newClassTypeName.trim() });
      setnewClassTypeName('');
      fetchClassType();
    } catch (error) {
      console.error('Error adding class Type:', error);
    }
  };

  const deleteClassType = async (classTypeId) => {
    try {
      await deleteDoc(doc(db, 'classType', classTypeId));
      fetchClassType();
    } catch (error) {
      console.error('Error deleting class type:', error);
    }
  };

  const startEditing = (classType) => {
    setEditingId(classType.id);
    setEditingName(classType.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = async () => {
    if (!editingName.trim()) {
      Alert.alert('Validation', 'ClassType name cannot be empty.');
      return;
    }
    try {
      const classTypeRef = doc(db, 'classType', editingId);
      await updateDoc(classTypeRef, { name: editingName.trim() });
      cancelEdit();
      fetchClassType();
    } catch (error) {
      console.error('Error updating class type:', error);
    }
  };

  const renderItem = ({ item }) => {
    if (editingId === item.id) {
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
      <ClassTypeCard
        classType={item}
        onEdit={startEditing}
        onDelete={() =>
          Alert.alert(
            'Confirm Deletion',
            `Are you sure you want to delete "${item.name}"?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteClassType(item.id) },
            ]
          )
        }
      />
    );
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <Text style={styles.header}>Manage Class Type</Text>

        <View style={styles.addSection}>
          <TextInput
            style={styles.input}
            placeholder="New Class Type"
            value={newClassTypeName}
            onChangeText={setnewClassTypeName}
          />
                    <TouchableOpacity style={styles.addButton} onPress={addClassType}>
                      <Text style={styles.buttonText}>Add Class Type</Text>
                    </TouchableOpacity>
        </View>

        <FlatList
          data={classType}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No Class Type available.</Text>}
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
