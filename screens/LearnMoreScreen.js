import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function LearnMoreScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>TimeToTeach</Text>
        <Text style={styles.subtitle}>Where every class finds its time.</Text>

        <LinearGradient colors={['#147099', '#1f3a93']} style={styles.card}>
          <Text style={styles.sectionTitle}>Welcome</Text>
          <Text style={styles.paragraph}>
            TimeToTeach is the smart way to manage classes. Whether you're a teacher or student, it helps you stay organized with class scheduling, attendance tracking, and a personalized calendar.
          </Text>
          <Text style={styles.paragraph}>
            Designed to simplify academic life, TimeToTeach keeps everything you need to teach and learn right at your fingertips.
          </Text>
        </LinearGradient>

        <LinearGradient colors={['#1f3a93', '#0f2027']} style={styles.card}>
          <Text style={styles.sectionTitle}>Contact Us</Text>

          <View style={styles.contactItem}>
            <Icon name="email-outline" size={24} color="#fff" style={styles.contactIcon} />
            <Text style={styles.contactText}>support@timetoteach.app</Text>
          </View>

          <View style={styles.contactItem}>
            <Icon name="instagram" size={24} color="#fff" style={styles.contactIcon} />
            <Text style={styles.contactText}>@timetoteach_app</Text>
          </View>

          <View style={styles.contactItem}>
            <Icon name="phone-outline" size={24} color="#fff" style={styles.contactIcon} />
            <Text style={styles.contactText}>+351 912 345 678</Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1f3a93',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#0f2027',
    marginBottom: 30,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  card: {
    padding: 25,
    borderRadius: 9,
    width: '100%',

    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    color: '#f0f0f0',
    marginBottom: 12,
    lineHeight: 24,
    textAlign: 'left',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'center',
  },
  contactIcon: {
    marginRight: 10,
  },
  contactText: {
    fontSize: 16,
    color: '#fff',
  },
});
