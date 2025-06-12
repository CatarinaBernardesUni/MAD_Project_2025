import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import app from '../../firebase';

const db = getFirestore(app);

const screenWidth = Dimensions.get('window').width;

const Dashboard = () => {
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [barChartData, setBarChartData] = useState(null);
  const yMax = barChartData ? Math.max(...barChartData.datasets[0].data) : 0;

  useEffect(() => {
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

    fetchAttendance();
  }, []);


  useEffect(() => {
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

    fetchBarData();
  }, []);


  // Calculate percentages for pie chart
  const total = presentCount + absentCount;
  const pieData = [
    {
      name: `Present (${((presentCount / total) * 100).toFixed(0)}%)`,
      population: isNaN(presentCount) ? 0 : presentCount,
      color: '#4CAF50',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
    {
      name: `Absent (${((absentCount / total) * 100).toFixed(0)}%)`,
      population: isNaN(absentCount) ? 0 : absentCount,
      color: '#F44336',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
  ];

  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>TimeToTeach</Text>
      <Text style={styles.section}>Dashboard</Text>

      <Text style={styles.stats}>
        [ Teachers: 12 ] [ Students: 150 ] [ Classes Today: 5 ]{'\n'}
        [ Avg Attendance: 88% ] [ Unmarked Sessions: 3 ]
      </Text>

      <Text style={styles.alerts}>3 classes today don’t have attendance marked</Text>

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
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Class Activity: 16/05 - 20/05</Text>
        {barChartData && (
          <BarChart
            data={barChartData}
            width={screenWidth - 32}
            height={220}
            fromZero={true}
            segments={yMax}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: () => '#000',
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
  container: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  section: { fontSize: 20, marginTop: 20 },
  stats: { marginVertical: 16, fontSize: 16, lineHeight: 24 },
  alerts: { color: 'red', marginBottom: 20 },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  chartTitle: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Dashboard;