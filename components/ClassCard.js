import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const formatTimeRange = (start, end) => {
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options = { hour: '2-digit', minute: '2-digit' };
    return `${startDate.toLocaleTimeString([], options)} - ${endDate.toLocaleTimeString([], options)}`;
  } catch (err) {
    return 'Invalid Time';
  }
};

const formatDate = (date) => {
  try {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (err) {
    return 'Invalid Date';
  }
};

const ClassCard = ({ item, onEdit, onDelete }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.subject}>{String(item.subject)}</Text>
      <Text style={styles.date}>Date: {formatDate(item.start)}</Text>
      <Text style={styles.time}>{formatTimeRange(item.start, item.end)}</Text>
      <Text style={styles.professor}>Prof. {String(item.professor)}</Text>
      <Text style={styles.notes}>Notes: {item.additionalNotes ? String(item.additionalNotes) : 'N/A'}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.editButton} onPress={() => onEdit(item)}>
          <Text>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item.id)}>
          <Text>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F2F6FC',
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 2,
  },
  subject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#777',
    marginBottom: 2,
  },
  time: {
    fontSize: 14,
    color: '#555',
  },
  professor: {
    marginTop: 4,
    fontSize: 14,
    color: '#333',
  },
  notes: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 6,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#D0E6FF',
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#FFD0D0',
    padding: 8,
    borderRadius: 6,
  },
});

export default ClassCard;