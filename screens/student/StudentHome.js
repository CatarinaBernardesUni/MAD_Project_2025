import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const StudentHome = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const user = getAuth().currentUser;
        if (!user) return;

        // Get all enrollments for this student
        const enrollSnap = await getDocs(collection(db, 'enrolment'));
        const classIds = [];
        enrollSnap.forEach(docSnap => {
          const data = docSnap.data();
          const studentId = data.student?.id || (typeof data.student === 'string' ? data.student.split('/').pop() : null);
          const classId = data.class?.id || (typeof data.class === 'string' ? data.class.split('/').pop() : null);
          if (studentId === user.uid && classId) {
            classIds.push(classId);
          }
        });

        // Get class data for each enrolled class, including subject and teacher names
        const classDataList = [];
        for (const classId of classIds) {
          const classSnap = await getDoc(doc(db, 'classes', classId));
          if (classSnap.exists()) {
            const classData = { id: classId, ...classSnap.data() };

            // Fetch subject name
            let subjectName = '';
            const subjectId = classData.subject?.id || (typeof classData.subject === 'string' ? classData.subject.split('/').pop() : null);
            if (subjectId) {
              const subjectSnap = await getDoc(doc(db, 'subjects', subjectId));
              if (subjectSnap.exists()) {
                subjectName = subjectSnap.data().name || '';
              }
            }

            // Fetch teacher name
            let teacherName = '';
            const teacherId = classData.professor?.id || (typeof classData.professor === 'string' ? classData.professor.split('/').pop() : null);
            if (teacherId) {
              const teacherSnap = await getDoc(doc(db, 'users', teacherId));
              if (teacherSnap.exists()) {
                teacherName = teacherSnap.data().name || '';
              }
            }

            classDataList.push({ ...classData, subjectName, teacherName });
          }
        }

        // Separate into today's and upcoming
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todays = [];
        const upcoming = [];

        classDataList.forEach(cls => {
          let startDate = cls.start;
          if (startDate && startDate.seconds) {
            startDate = new Date(startDate.seconds * 1000);
          } else if (typeof startDate === 'string' || typeof startDate === 'number') {
            startDate = new Date(startDate);
          }
          if (!startDate || isNaN(startDate.getTime())) return;

          const classDay = new Date(startDate);
          classDay.setHours(0, 0, 0, 0);

          if (classDay.getTime() === today.getTime()) {
            todays.push(cls);
          } else if (classDay > today) {
            upcoming.push(cls);
          }
        });

        // Sort by start time
        todays.sort((a, b) => new Date(a.start) - new Date(b.start));
        upcoming.sort((a, b) => new Date(a.start) - new Date(b.start));

        setTodaysClasses(todays);
        setUpcomingClasses(upcoming);
      } catch (err) {
        // Handle error if needed
      }
      setLoading(false);
    };

    fetchClasses();
  }, []);

  const renderClass = (cls) => {
    let startDate = cls.start;
    let endDate = cls.end;
    if (startDate && startDate.seconds) startDate = new Date(startDate.seconds * 1000);
    if (endDate && endDate.seconds) endDate = new Date(endDate.seconds * 1000);

    const date = startDate ? startDate.toLocaleDateString() : '';
    const startTime = startDate ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const endTime = endDate ? endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    return (
      <View style={styles.classCard}>
        <Text style={styles.classTitle}>{cls.subjectName || 'Class'} - {cls.classType || ''}</Text>
        <Text style={styles.classInfo}>Teacher: {cls.teacherName || 'Unknown'}</Text>
        <Text style={styles.classInfo}>Date: {date}</Text>
        <Text style={styles.classInfo}>Time: {startTime} - {endTime}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F6FC' }}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Student Home</Text>
          <Text style={styles.welcomeText}>
            Welcome, Student! 😊{'\n'}Here's what's coming up next:
          </Text>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : (
            <>
              <Text style={styles.sectionTitle}>Today</Text>
              {todaysClasses.length === 0 ? (
                <Text style={styles.text}>No classes today.</Text>
              ) : (
                <FlatList
                  data={todaysClasses}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => renderClass(item)}
                  scrollEnabled={false}
                />
              )}

              <Text style={styles.sectionTitle}>Upcoming Classes</Text>
              {upcomingClasses.length === 0 ? (
                <Text style={styles.text}>No upcoming classes.</Text>
              ) : (
                <FlatList
                  data={upcomingClasses}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => renderClass(item)}
                  scrollEnabled={false}
                />
              )}
            </>
          )}
        </ScrollView>
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={() => {
              if (typeof navigation !== 'undefined') {
                navigation.navigate('StudentCalendar');
              }
            }}
          >
            <Text style={styles.calendarButtonText}>View Full Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              try {
                await signOut(auth);
              } catch (error) {
                // Handle error
              }
            }}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F2F6FC', alignItems: 'flex-start' },
  title: { fontSize: 24, color: '#000', fontWeight: 'bold', marginBottom: 10, alignSelf: 'flex-start' },
  welcomeText: { fontSize: 16, color: '#444', textAlign: 'left', marginBottom: 18, alignSelf: 'flex-start' },
  sectionTitle: { fontSize: 20, color: '#4A90E2', fontWeight: 'bold', marginTop: 24, marginBottom: 8, alignSelf: 'flex-start' },
  text: { fontSize: 16, color: '#444', textAlign: 'left', alignSelf: 'flex-start' },
  classCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, width: 320, alignSelf: 'center', elevation: 2 },
  classTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4, color: '#000' },
  classInfo: { fontSize: 14, color: '#555', marginBottom: 2 },
  bottomButtonsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 20, marginTop: 10 },
  calendarButton: { alignSelf: 'center', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 25, backgroundColor: '#3a9dde', marginRight: 8 },
  calendarButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutButton: { alignSelf: 'center', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 25, backgroundColor: '#FF6B6B', marginLeft: 8 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default StudentHome;