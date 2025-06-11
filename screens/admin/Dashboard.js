import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const Dashboard = () => {

  const pieData = [
    {
      name: 'Given',
      population: 70,
      color: '#4CAF50',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
    {
      name: 'Missed',
      population: 30,
      color: '#F44336',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
  ];

  const barChartData = {
    labels: ['16/05', '17/05', '18/05', '19/05', '20/05'],
    datasets: [
      {
        data: [4, 5, 3, 6, 4],
      },
    ],
  };

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
        <Text style={styles.chartTitle}>Scheduled Classes Given Today</Text>
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
        <BarChart
          data={barChartData}
          width={screenWidth - 32}
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            labelColor: () => '#000',
            propsForBackgroundLines: {
              strokeDasharray: '',
            },
          }}
          style={{ borderRadius: 16 }}
        />
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