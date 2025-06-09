import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function StudentClassFilters({
  filtersVisible,
  setFiltersVisible,
  filterClassId,
  setFilterClassId,
  filterSubject,
  setFilterSubject,
  filterTeacher,
  setFilterTeacher,
  subjectOptions,
  teacherOptions,
  styles, 
}) {
  const filteredTeachers = React.useMemo(() => {
    if (!filterSubject) return teacherOptions;
    const selectedSubject = subjectOptions.find(s => s.id === filterSubject)?.name;
    return teacherOptions.filter(t =>
      Array.isArray(t.subjects) && t.subjects.includes(selectedSubject)
    );
  }, [filterSubject, teacherOptions, subjectOptions]);

  return (
    <>
      {!filtersVisible && (
        <TouchableOpacity
          style={[styles.editButton, { alignSelf: 'flex-end', marginBottom: 16 }]}
          onPress={() => setFiltersVisible(true)}
        >
          <Text style={styles.actionText}>Show Filters</Text>
        </TouchableOpacity>
      )}
      {filtersVisible && (
        <View style={styles.filterBox}>
          <Text style={styles.filterLabel}>Filter by Class ID:</Text>
          <TextInput
            style={styles.input}
            placeholder="Class ID"
            value={filterClassId}
            onChangeText={setFilterClassId}
          />
          <Text style={styles.filterLabel}>Filter by Subject:</Text>
          <View style={localStyles.pickerContainer}>
            <Picker
              selectedValue={filterSubject}
              onValueChange={setFilterSubject}
              style={localStyles.picker}
            >
              <Picker.Item label="All Subjects" value="" />
              {subjectOptions.map(subj => (
                <Picker.Item key={subj.id} label={subj.name} value={subj.id} />
              ))}
            </Picker>
          </View>
          <Text style={styles.filterLabel}>Filter by Teacher:</Text>
          <View style={localStyles.teacherRow}>
            {filteredTeachers.map(teacher => (
              <TouchableOpacity
                key={teacher.id}
                style={[
                  styles.teacherButton,
                  filterTeacher === teacher.id && styles.teacherButtonSelected,
                ]}
                onPress={() => setFilterTeacher(teacher.id)}
              >
                <Text style={filterTeacher === teacher.id ? styles.teacherButtonTextSelected : styles.teacherButtonText}>
                  {teacher.name}
                </Text>
              </TouchableOpacity>
            ))}
            {filteredTeachers.length === 0 && (
              <Text style={{ color: '#888' }}>No teachers for this subject.</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.editButton, { alignSelf: 'flex-end', marginTop: 8 }]}
            onPress={() => setFiltersVisible(false)}
          >
            <Text style={styles.actionText}>Hide Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const localStyles = StyleSheet.create({
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8,
     backgroundColor: '#fff', width: '100%', justifyContent: 'center' },
  picker: { width: '100%', height: 54, fontSize: 16 },
  teacherRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
});