import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LearnMoreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>TimeToTeach</Text>
      <Text style={styles.quote}>“Where every class finds its time.”</Text>

      <Text style={styles.paragraph}>
        Welcome to TimeToTeach – the smart way to manage classes.
        Whether you’re a teacher or student, TimeToTeach helps you stay organized with easy class scheduling, attendance tracking, and a personalized calendar.
        Designed to simplify academic life, it puts everything you need to teach and learn—right at your fingertips.
      </Text>

      <Text style={styles.contact}>Email: support@timetoteach.app</Text>
      <Text style={styles.contact}>Instagram: @timetoteach_app</Text>
      <Text style={styles.contact}>Phone: +351 912 345 678</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flex: 1, justifyContent: 'center' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  quote: { fontSize: 16, fontStyle: 'italic', marginBottom: 20 },
  paragraph: { fontSize: 14, marginBottom: 20 },
  contact: { fontSize: 14, marginTop: 4 },
});