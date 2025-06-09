import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import StatusBar from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function HomepageScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  // Floating animation for background shapes
  const blinkAnim1 = useRef(new Animated.Value(0)).current;
  const blinkAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main text animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim1, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
        Animated.timing(blinkAnim1, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim2, { toValue: 0.3, duration: 3000, useNativeDriver: true }),
        Animated.timing(blinkAnim2, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient colors={['#1f3a93', '#0f2027']} style={styles.container}>
      <Animated.View
        style={[
          styles.floatingCircle,
          { top: height * 0.2, left: width * 0.2, opacity: blinkAnim1 },
        ]}
      />
      <Animated.View
        style={[
          styles.floatingCircle,
          { top: height * 0.6, right: width * 0.1, opacity: blinkAnim2 },
        ]}
      />

      {/* Main Content */}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <Text style={styles.title}>TimeToTeach</Text>
        <Text style={styles.subtitle}>“Where every class finds its time.”</Text>

        <View style={styles.buttonGroup}>
          <CustomButton title="Log In" onPress={() => navigation.navigate('LoginScreen')} />
          <CustomButton title="Sign Up" onPress={() => navigation.navigate('SignupScreen')} />
          <CustomButton title="Learn More" onPress={() => navigation.navigate('LearnMoreScreen')} />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const CustomButton = ({ title, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 42, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 18, textAlign: 'center', color: '#f0f0f0', marginBottom: 40 },
  buttonGroup: { flexDirection: 'column', width: '100%', gap: 15},
  button: {
    width: 210,
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 30,
    backgroundColor: '#3b5998',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  floatingCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
