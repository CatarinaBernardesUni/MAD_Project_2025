import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function StudentCard({ student, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => setExpanded(prev => !prev);

  return (
    <TouchableOpacity style={styles.card} onPress={handleToggle}>
      {student.profilePicture ? (
  <Image source={{ uri: student.profilePicture }} style={styles.profileImage} />
) : (
  <View style={[styles.profileImage, styles.placeholder]}>
    <Text style={styles.initials}>
      {student.name ? student.name.charAt(0).toUpperCase() : '?'}
    </Text>
  </View>
)}
      <View style={styles.info}>
        <Text style={styles.text}><Text style={styles.label}>ID:</Text> {student.id}</Text>
        <Text style={styles.text}><Text style={styles.label}>Name:</Text> {student.name}</Text>
        <Text style={styles.text}><Text style={styles.label}>Email:</Text> {student.email}</Text>
      </View>

      {expanded && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(student)}>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(student)}>
            <Text style={styles.actionText}>Block Student</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  info: {
    flex: 1,
    minWidth: '60%',
  },
  text: {
    fontSize: 14,
    marginBottom: 2,
  },
  label: {
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
    justifyContent: 'flex-end',
  },
  editBtn: {
    backgroundColor: '#4A90E2',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  deleteBtn: {
    backgroundColor: '#E24A4A',
    marginLeft: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  profileImage: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: '#ccc',
  marginRight: 12,
  justifyContent: 'center',
  alignItems: 'center',
},
placeholder: {
  backgroundColor: '#999',
},
initials: {
  color: '#fff',
  fontSize: 24,
  fontWeight: 'bold',
},

});
