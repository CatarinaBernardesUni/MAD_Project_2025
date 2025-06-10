import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const Dashboard = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>TimeToTeach</Text>
      <Text style={styles.section}>Dashboard</Text>

      <Text style={styles.stats}>
        [ Teachers: 12 ] [ Students: 150 ] [ Classes Today: 5 ]{'\n'}
        [ Avg Attendance: 88% ] [ Unmarked Sessions: 3 ]
      </Text>

      <Text style={styles.alerts}>3 classes today don’t have attendance marked</Text>

      <View style={styles.chartPlaceholder}>
        <Text>📊 70% of scheduled classes were given today</Text>
      </View>

      <View style={styles.chartPlaceholder}>
        <Text>📈 Activity Summary</Text>
        <Text>Bar chart: 16/05 to 20/05</Text>
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
  chartPlaceholder: {
    backgroundColor: '#eee',
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
});

export default Dashboard;