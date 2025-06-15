import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const Dashboard = () => {
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [barChartData, setBarChartData] = useState(null);
  const yMax = barChartData ? Math.max(...barChartData.datasets[0].data) : 0;
  const [teacherCount, setTeacherCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [todayClassCount, setTodayClassCount] = useState(0);
  const [unmarkedSessionCount, setUnmarkedSessionCount] = useState(0);

  const fetchTopStats = async () => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let teachers = 0;
    let students = 0;

    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (Array.isArray(data.roles) && data.roles.includes('teacher')) {
        teachers++;
      } else if (Array.isArray(data.roles) && data.roles.includes('student')) {
        students++;
      }
    });

    setTeacherCount(teachers);
    setStudentCount(students);

    const classesSnapshot = await getDocs(collection(db, 'classes'));
    const today = new Date();
    const todayDateString = today.toDateString();
    let todayClasses = 0;

    classesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.start && typeof data.start.toDate === 'function') {
        const startDate = data.start.toDate();
        if (startDate.toDateString() === todayDateString) {
          todayClasses++;
        }
      }
    });

    setTodayClassCount(todayClasses);

    const enrolmentSnapshot = await getDocs(collection(db, 'enrolment'));
    let unmarked = 0;

    enrolmentSnapshot.forEach(doc => {
      const data = doc.data();
      if (!('attendance' in data)) {
        unmarked++;
      }
    });

    setUnmarkedSessionCount(unmarked);
  };

  const fetchAttendance = async () => {
    const snapshot = await getDocs(collection(db, 'enrolment'));
    let present = 0;
    let absent = 0;

    snapshot.forEach(doc => {
      const data = doc.data();

      // Only count records where attendance field exists
      if ('attendance' in data) {
        if (data.attendance === true) {
          present++;
        } else if (data.attendance === false) {
          absent++;
        }
      }
    });

    setPresentCount(present);
    setAbsentCount(absent);
  };

  const fetchBarData = async () => {
    const snapshot = await getDocs(collection(db, 'classes'));
    const classCountByDate = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const startTimestamp = data.start;

      if (startTimestamp && typeof startTimestamp.toDate === 'function') {
        const dateObj = startTimestamp.toDate();    // Convert Firestore Timestamp to JS Date
        const dateLabel = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

        classCountByDate[dateLabel] = (classCountByDate[dateLabel] || 0) + 1;
      }
    });

    // Sort dates by actual date (not just string)
    const sortedEntries = Object.entries(classCountByDate).sort((a, b) => {
      const [dayA, monthA] = a[0].split('/').map(Number);
      const [dayB, monthB] = b[0].split('/').map(Number);
      const dateA = new Date(2025, monthA - 1, dayA);
      const dateB = new Date(2025, monthB - 1, dayB);
      return dateA - dateB;
    });

    // Take only the latest 5 entries
    const recentFive = sortedEntries.slice(-5);

    const labels = recentFive.map(entry => entry[0]);
    const values = recentFive.map(entry => entry[1]);

    setBarChartData({
      labels,
      datasets: [{ data: values }],
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      const reloadData = async () => {
        await fetchTopStats();
        await fetchAttendance();
        await fetchBarData();
      };

      reloadData();
    }, [])
  );

  const total = presentCount + absentCount;
  const pieData = [
    {
      name: `Present`,
      population: isNaN(presentCount) ? 0 : presentCount,
      color: '#85d169',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
    {
      name: `Absent`,
      population: isNaN(absentCount) ? 0 : absentCount,
      color: '#ed6a5f',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
  ];



  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.section}>Quick Overview:</Text>

      <Text style={styles.stats}>
        [ Teachers: {teacherCount} ] [ Students: {studentCount} ]{'\n'}
        [ Classes Today: {todayClassCount} ]
        [ Unmarked Sessions: {unmarkedSessionCount} ]
      </Text>

      <Text style={styles.alerts}>{unmarkedSessionCount} classes with students enrolled don’t have attendance marked!</Text>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Average Attendace Summary</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="#ffffff"
          paddingLeft="15"
          absolute={false}
          style={{ borderRadius: 16 }}
        />
        <Text style={{ marginTop: 8, fontSize: 14, color: '#555' }}>
          {total > 0 ? `Total Student Attendances Marked: ${total}` : 'No attendance records found.'}
        </Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Recent Class Activity</Text>
        {barChartData && (
          <BarChart
            data={barChartData}
            width={screenWidth - 32}
            height={220}
            fromZero={true}
            segments={yMax}
            showValuesOnTopOfBars={true}
            barPercentage={0.7}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: () => '#5aacd6',
              labelColor: () => '#000',
              fillShadowGradient: '#5aacd6',
              fillShadowGradientOpacity: 1,
              propsForBackgroundLines: {
                strokeWidth: 1.5,
                stroke: '#e3e3e3',
              },
            }}
            style={{ borderRadius: 16 }}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f0f4f8' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'flex-start' },
  section: { fontSize: 20, marginTop: 5 },
  stats: { marginVertical: 7, fontSize: 16, lineHeight: 24 },
  alerts: { color: 'red', marginBottom: 10, fontSize: 16, fontWeight: 'bold' },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Dashboard;