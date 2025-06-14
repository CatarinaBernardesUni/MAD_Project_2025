import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut, getAuth } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

export default function TeacherHome({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [todaysClasses, setTodaysClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [teacherName, setTeacherName] = useState('');

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const user = getAuth().currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setTeacherName(userDoc.data().name || '');
      }

      const classSnap = await getDocs(collection(db, 'classes'));
      const classDataList = [];
      for (const docSnap of classSnap.docs) {
      const classData = { id: docSnap.id, ...docSnap.data() };

      if (classData.professor?.id !== user.uid) continue;

      let subjectName = '';
      if (classData.subject?.id) {
        const subjectSnap = await getDoc(classData.subject);
        if (subjectSnap.exists()) {
          subjectName = subjectSnap.data().name || '';
        }
      }

      classDataList.push({ ...classData, subjectName });
    }

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

      todays.sort((a, b) => {
        const aDate = a.start?.seconds ? new Date(a.start.seconds * 1000) : new Date(a.start);
        const bDate = b.start?.seconds ? new Date(b.start.seconds * 1000) : new Date(b.start);
        return aDate - bDate;
      });
      upcoming.sort((a, b) => {
        const aDate = a.start?.seconds ? new Date(a.start.seconds * 1000) : new Date(a.start);
        const bDate = b.start?.seconds ? new Date(b.start.seconds * 1000) : new Date(b.start);
        return aDate - bDate;
      });

      setTodaysClasses(todays);
      setUpcomingClasses(upcoming);
    } catch (err) {
    }
    setLoading(false);
  };

  const syncEmail = async () => {
    try {
      const user = getAuth().currentUser;
      if (!user) return;

      // Force refresh the user to get the most updated email
      await user.reload();

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const firestoreEmail = userSnap.data().email;
        if (firestoreEmail !== user.email) {
          // Update Firestore email to match the authenticated email
          await updateDoc(userRef, { email: user.email });
          // console.log('Email synced in Firestore:', user.email);
        }
      }
    } catch (error) {
      console.error('Error syncing email:', error);
    }
  };

  useEffect(() => {
    syncEmail();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchClasses();
    }, [])
  );

  const renderClass = ({ item: cls, showAttendanceButton = false }) => {
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
        <Text style={styles.classInfo}>Date: {date}</Text>
        <Text style={styles.classInfo}>Time: {startTime} - {endTime}</Text>

        {showAttendanceButton && (
          <TouchableOpacity
            style={styles.attendanceButton}
            onPress={() => { navigation.navigate('TeacherMarkAttendance', { selectedClassId: cls.id }); }}
          >
            <Text style={styles.attendanceButtonText}>Mark Attendance</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: '#F2F6FC' }}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Home</Text>
          <Text style={styles.welcomeText}>
            Welcome, Teacher{teacherName ? ` ${teacherName}` : ''}! {'\n'}Here's what's coming up next:
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
                  renderItem={({ item }) => renderClass({ item, showAttendanceButton: true })}
                  scrollEnabled={false}
                />
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 8 }}>
                <Text style={[styles.sectionTitle, { flex: 1, marginTop: 0, marginBottom: 0 }]}>Upcoming Classes</Text>
                <TouchableOpacity
                  style={[styles.addClassButton, { alignSelf: 'auto', paddingVertical: 8, paddingHorizontal: 14 }]}
                  onPress={() => {
                    if (typeof navigation !== 'undefined') {
                      navigation.navigate('TeacherAddClass');
                    }
                  }}
                >
                  <Text style={styles.addClassButtonText}>Add Class</Text>
                </TouchableOpacity>
              </View>
              {upcomingClasses.length === 0 ? (
                <Text style={styles.text}>No upcoming classes.</Text>
              ) : (
                <FlatList
                  data={upcomingClasses}
                  keyExtractor={item => item.id}
                  renderItem={renderClass}
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
                navigation.navigate('TeacherCalendar');
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
              } catch (error) { }
            }}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F2F6FC', alignItems: 'flex-start' },
  title: { fontSize: 24, color: '#000', fontWeight: 'bold', marginBottom: 8, alignSelf: 'flex-start' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 18, alignSelf: 'flex-start' },
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
  addClassButton: { alignSelf: 'center', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 25, backgroundColor: '#3a9dde', marginRight: 8 },
  addClassButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  attendanceButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  attendanceButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

});