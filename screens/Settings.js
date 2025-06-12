import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Settings({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate('EditProfile')}>
        <Text style={styles.optionText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate('NotificationSettings')}>
        <Text style={styles.optionText}>Notification Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  option: {
    padding: 20,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 16,
  },
  optionText: { fontSize: 18 },
});
