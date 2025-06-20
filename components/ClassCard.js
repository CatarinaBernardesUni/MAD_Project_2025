import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

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

const ClassCard = ({ item, onEdit, onDelete, classTypeOptions = [] }) => {
  const [expanded, setExpanded] = useState(false);

  const classTypeName =
    classTypeOptions.find(opt => opt.id === item.classType)?.name ||
    classTypeOptions.find(opt => opt.name === item.classType)?.name ||
    item.classType;

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this class?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
      ]
    );
  };

  const peopleLimitDisplay =
    !item.peopleLimit || Number(item.peopleLimit) === 0
      ? 'No limit'
      : String(item.peopleLimit);

  return (
    <TouchableOpacity
      onPress={() => setExpanded(prev => !prev)}
      style={styles.card}
    >
      <Text style={styles.subject}>{String(item.subject)}</Text>
      <Text style={styles.date}>Date: {formatDate(item.start)}</Text>
      <Text style={styles.time}>{formatTimeRange(item.start, item.end)}</Text>
      <Text style={styles.teacher}>Teacher: {String(item.professor)}</Text>
      <Text>Class Type: {classTypeName}</Text>
      <Text style={styles.notes}>
        Notes: {item.additionalNotes ? String(item.additionalNotes) : 'N/A'}
      </Text>
      <Text style={styles.notes}>
        People Limit: {peopleLimitDisplay}
      </Text>

      {expanded && (
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(item)}
          >
            <Text>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#F2F6FC', padding: 16, marginVertical: 8, borderRadius: 10, elevation: 2, },
  subject: { fontSize: 18, fontWeight: 'bold', color: '#4A90E2', marginBottom: 4, },
  date: { fontSize: 14, color: '#777', marginBottom: 2, },
  time: { fontSize: 14, color: '#555', },
  teacher: { marginTop: 4, fontSize: 14, color: '#333', },
  notes: { fontSize: 13, fontStyle: 'italic', marginTop: 6, },
  limit: { fontSize: 14, color: '#333', marginTop: 4, },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, },
  editButton: { backgroundColor: '#D0E6FF', padding: 8, borderRadius: 6, marginRight: 8, },
  deleteButton: { backgroundColor: '#FFD0D0', padding: 8, borderRadius: 6, },
});

export default ClassCard;