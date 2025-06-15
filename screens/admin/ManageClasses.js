import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import ClassCard from '../../components/ClassCard';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

const fetchRefName = async (refPath, field = 'name') => {
  try {
    if (!refPath || typeof refPath !== 'string') return 'Unknown';
    const ref = doc(db, refPath);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return data[field] || data.name || data.fullName || 'Unnamed';
    } else {
      return 'Not Found';
    }
  } catch (err) {
    Alert.alert(
      'Failed to Load Classes',
      'We encountered a problem while loading the classes. Please try again later.',
      [{ text: 'OK' }]
    );
  }
};

const ManageClasses = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterForm, setFilterForm] = useState({
    classId: '',
    teacher: '',
    subject: '',
    date: '',
    classType: '',
  });
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [classTypeOptions, setClassTypeOptions] = useState([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'classes'));

      const fetched = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();

          let professorRef = data.professor || '';
          let professorId = '';
          if (typeof professorRef === 'string') {
            professorId = professorRef.split('/')[1] || '';
          } else if (professorRef && professorRef.id) {
            professorId = professorRef.id;
            professorRef = `users/${professorId}`;
          }

          const professorName = professorRef && professorId
            ? await fetchRefName(professorRef, 'name')
            : 'Unknown';

          let subjectRef = data.subject || '';
          let subjectId = '';
          if (typeof subjectRef === 'string') {
            subjectId = subjectRef.split('/')[1] || '';
          } else if (subjectRef && subjectRef.id) {
            subjectId = subjectRef.id;
            subjectRef = `subjects/${subjectId}`;
          }

          const subjectName = subjectRef && subjectId
            ? await fetchRefName(subjectRef, 'name')
            : 'Unknown';

          return {
            id: docSnap.id,
            subject: subjectName,
            subjectId,
            professor: professorName,
            professorId,
            classType: data.classType || '',
            additionalNotes: data.additionalNotes || '',
            start: data.start?.toDate?.() || new Date(),
            end: data.end?.toDate?.() || new Date(),
            peopleLimit: data.peopleLimit !== undefined && data.peopleLimit !== null ? data.peopleLimit : null,
          };
        })
      );

      setClasses(fetched);
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
  Alert.alert(
    'Delete Class',
    'Are you sure you want to delete this class? This action cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'classes', id));
            Alert.alert('Class Deleted', 'The class has been successfully removed.');
            fetchClasses();
          } catch (err) {
            console.error('Error deleting class:', err);
            Alert.alert(
              'Deletion Failed',
              'Unable to delete the class at this time. Please try again later.'
            );
          }
        },
      },
    ]
  );
};

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setFilterForm((prev) => ({
        ...prev,
        date: date.toISOString().split('T')[0], // Store as YYYY-MM-DD
      }));
    }
  };

  useEffect(() => {
    const fetchDropdowns = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const teachers = usersSnap.docs
        .filter(doc => {
          const roles = doc.data().roles || [];
          return Array.isArray(roles) && roles.includes('teacher');
        })
        .map(doc => ({
          id: doc.id,
          name: doc.data().name || doc.data().fullName || doc.id,
        }));
      setTeacherOptions(teachers);

      const subjectsSnap = await getDocs(collection(db, 'subjects'));
      const subjects = subjectsSnap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || doc.id,
      }));
      setSubjectOptions(subjects);

      const classTypesSnap = await getDocs(collection(db, 'classType'));
      const classTypes = classTypesSnap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || doc.id,
      }));
      setClassTypeOptions(classTypes);
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Manage Classes</Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddClass')}>
            <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Add Class</Text>
          </TouchableOpacity>
        </View>

        {filtersVisible && (
          <>
            <Text style={{ marginBottom: 8 }}>Filters:</Text>
            <TextInput
              style={styles.input}
              placeholder="Class ID"
              value={filterForm.classId}
              onChangeText={v => setFilterForm(f => ({ ...f, classId: v }))}
            />

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={filterForm.teacher}
                onValueChange={v => setFilterForm(f => ({ ...f, teacher: v }))}
                dropdownIconColor="#333"
              >
                <Picker.Item label="All Teachers" value="" />
                {teacherOptions.map((teacher) => (
                  <Picker.Item key={teacher.id} label={teacher.name} value={teacher.id} />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={filterForm.subject}
                onValueChange={v => setFilterForm(f => ({ ...f, subject: v }))}
                dropdownIconColor="#333"
              >
                <Picker.Item label="All Subjects" value="" />
                {subjectOptions.map((subject) => (
                  <Picker.Item key={subject.id} label={subject.name} value={subject.id} />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={filterForm.classType}
                onValueChange={v => setFilterForm(f => ({ ...f, classType: v }))}
                dropdownIconColor="#333"
              >
                <Picker.Item label="All Class Types" value="" />
                {classTypeOptions.map((type) => (
                  <Picker.Item key={type.id} label={type.name} value={type.name} />
                ))}
              </Picker>
            </View>

            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={[styles.input, { flex: 1 }]} // Makes the input take available space
                >
                  <Text>
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>Date: </Text>
                    {filterForm.date ? new Date(filterForm.date).toLocaleDateString() : 'Select Date'}
                  </Text>
                </TouchableOpacity>

                {filterForm.date !== '' && (
                  <TouchableOpacity
                    onPress={() => setFilterForm((prev) => ({ ...prev, date: '' }))}
                    style={{
                      marginLeft: 8,
                      backgroundColor: '#E57373',
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 6,
                      marginBottom: 12
                    }}
                  >
                    <Text style={{ color: '#fff' }}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={filterForm.date ? new Date(filterForm.date) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) {
                      setFilterForm((prev) => ({
                        ...prev,
                        date: date.toISOString().split('T')[0],
                      }));
                    }
                  }}
                />
              )}
            </View>

            <TouchableOpacity
              style={[styles.addButton, { alignSelf: 'flex-end', marginBottom: 16 }]}
              onPress={() => setFiltersVisible(false)}
            >
              <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Hide Filters</Text>
            </TouchableOpacity>
          </>
        )}

        {!filtersVisible && (
          <TouchableOpacity
            style={[styles.addButton, { alignSelf: 'flex-end', marginBottom: 16 }]}
            onPress={() => setFiltersVisible(true)}
          >
            <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Show Filters</Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            data={classes.filter(
              (c) =>
                c.id.includes(filterForm.classId) &&
                (filterForm.teacher === '' || c.professorId === filterForm.teacher) &&
                (filterForm.subject === '' || c.subjectId === filterForm.subject) &&
                (filterForm.classType === '' || c.classType === filterForm.classType) &&
                (!filterForm.date ||
                  c.start.toISOString().slice(0, 10).includes(filterForm.date))
            )}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ClassCard
                item={item}
                onEdit={(classItem) => navigation.navigate('EditClass', { classData: classItem })}
                onDelete={handleDelete}
                classTypeOptions={classTypeOptions}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 12 },
  addButton: { backgroundColor: '#5996b5', padding: 8, borderRadius: 6, alignSelf: 'flex-end', marginBottom: 6 },
  input: { borderColor: '#ccc', borderWidth: 1, padding: 8, marginBottom: 12, borderRadius: 6 },
  pickerWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 12, overflow: 'hidden', height: 40, justifyContent: 'center', },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
});

export default ManageClasses;