import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomepageScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TimeToTeach</Text>
      <Text style={styles.subtitle}>“Where every class finds its time.”</Text>

      <View style={styles.buttonGroup}>
        <Button title="Log In" onPress={() => navigation.navigate('LoginScreen')} />
        <Button title="Sign Up" onPress={() => navigation.navigate('SignupScreen')} />
        <Button title="Learn more about app" onPress={() => navigation.navigate('LearnMoreScreen')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40 },
  buttonGroup: { width: '100%', gap: 10 },
});