import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, getDocs, collection } from 'firebase/firestore';

const TeacherSubjects = () => {
  const [mySubjects, setMySubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [addSubject, setAddSubject] = useState('');
  const [loading, setLoading] = useState(true);

  const teacherId = getAuth().currentUser?.uid;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!teacherId) return;
      const userRef = doc(db, 'users', teacherId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setMySubjects(userSnap.data().subjects || []);
      }
      const subjectsSnap = await getDocs(collection(db, 'subjects'));
      setAllSubjects(subjectsSnap.docs.map(d => d.data().name));
      setLoading(false);
    };
    fetchData();
  }, [teacherId]);

  const handleRemove = (subject) => {
    Alert.alert(
      'Remove Subject',
      `Are you sure you want to remove "${subject}" from your subjects?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const userRef = doc(db, 'users', teacherId);
              const newSubjects = mySubjects.filter(s => s !== subject);
              await updateDoc(userRef, { subjects: newSubjects });
              setMySubjects(newSubjects);
            } catch (err) {
              Alert.alert('Error', 'Could not remove subject.');
            }
          }
        }
      ]
    );
  };

  const handleAdd = (subject) => {
    Alert.alert(
      'Add Subject',
      `Are you sure you want to add "${subject}" to your subjects?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            if (!subject) return;
            if (!allSubjects.includes(subject)) {
              Alert.alert('Invalid subject', 'Please select a valid subject.');
              return;
            }
            if (mySubjects.includes(subject)) {
              Alert.alert('Already added', 'You already have this subject.');
              return;
            }
            try {
              const userRef = doc(db, 'users', teacherId);
              const newSubjects = [...mySubjects, subject];
              await updateDoc(userRef, { subjects: newSubjects });
              setMySubjects(newSubjects);
              setAddSubject('');
            } catch (err) {
              Alert.alert('Error', 'Could not add subject.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Subjects</Text>
      <FlatList
        data={mySubjects}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <View style={styles.subjectRow}>
            <Text style={styles.subjectText}>{item}</Text>
            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item)}>
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.text}>No subjects assigned.</Text>}
      />

      <Text style={[styles.title]}>Add Subject</Text>

      <FlatList
        data={allSubjects.filter(subj => !mySubjects.includes(subj))}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <View style={styles.availableCard}>
            <Text style={styles.subjectText}>{item}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAdd(item)}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.text}>No more subjects to add.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F6FC', padding: 20 },
  title: { fontSize: 22, color: '#4A90E2', fontWeight: 'bold', marginBottom: 10 },
  text: { fontSize: 16, color: '#444', textAlign: 'center', marginVertical: 10 },
  subjectRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, backgroundColor: '#fff', borderRadius: 8, padding: 10 },
  subjectText: { flex: 1, fontSize: 16 },
  removeButton: { backgroundColor: '#FF6B6B', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  removeButtonText: { color: '#fff', fontWeight: 'bold' },
  addRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 8 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#ccc', marginRight: 8 },
  addButton: { backgroundColor: '#5ebb6d', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  availableCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 8 },
});

export default TeacherSubjects;