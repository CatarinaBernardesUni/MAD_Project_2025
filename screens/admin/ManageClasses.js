import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
  ActivityIndicator, TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import { collection, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import ClassCard from '../../components/ClassCard'; 
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
    console.error('Error resolving reference path:', refPath, err);
    return 'Error';
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

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'classes'));

      const fetched = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();

          const professorRef = data.professor || '';
          const professorId = professorRef.split('/')[1] || '';
          const professorName = professorRef && professorId
            ? await fetchRefName(data.professor, 'name')
            : 'Unknown';

          const subjectRef = data.subject || '';
          const subjectId = subjectRef.split('/')[1] || '';

          const subjectName = subjectRef && subjectId
            ? await fetchRefName(data.subject, 'name')
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

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'classes', id));
      fetchClasses();
    } catch (err) {
      console.error('Error deleting class:', err);
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
        <Text style={styles.header}>Manage Classes</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddClass')}
        >
          <Text>Add Class</Text>
        </TouchableOpacity>

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

            <TextInput
              style={styles.input}
              placeholder="Filter by Date (YYYY-MM-DD)"
              value={filterForm.date}
              onChangeText={v => setFilterForm(f => ({ ...f, date: v }))}
            />

            <TouchableOpacity
              style={[styles.addButton, { alignSelf: 'flex-end', marginBottom: 16 }]}
              onPress={() => setFiltersVisible(false)}
            >
              <Text>Hide Filters</Text>
            </TouchableOpacity>
          </>
        )}

        {!filtersVisible && (
          <TouchableOpacity
            style={[styles.addButton, { alignSelf: 'flex-end', marginBottom: 16 }]}
            onPress={() => setFiltersVisible(true)}
          >
            <Text>Show Filters</Text>
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
  container: {padding: 16, flex: 1 },
  header: {fontSize: 24, fontWeight: 'bold', marginBottom: 12},
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 12 },
  addButton: { backgroundColor: '#cde', padding: 8, borderRadius: 6, alignSelf: 'flex-end', marginBottom: 12 },
  input: {borderColor: '#ccc', borderWidth: 1, padding: 8, marginBottom: 12, borderRadius: 6 },
  pickerWrapper: {borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 12, overflow: 'hidden', height: 40, justifyContent: 'center',},
});

export default ManageClasses;