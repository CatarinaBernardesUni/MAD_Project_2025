import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

export default function ResetPasswordLogin({ navigation }) {
    const [email, setEmail] = useState('');

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Missing Email', 'Please enter your email address to continue.');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert('Email Sent', 'A password reset link has been sent to your email address. Please check your inbox and spam folder.');
            navigation.goBack();
        } catch (error) {
            let message = 'Something went wrong. Please try again later.';

            switch (error.code) {
                case 'auth/invalid-email':
                    message = 'The email address you entered is not valid. Please check and try again.';
                    break;
                case 'auth/too-many-requests':
                    message = 'Too many attempts. Please try again later.';
                    break;
                default:
                    message = 'Unable to send reset email. Please try again.';
            }

            Alert.alert('Reset Failed', message);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <LinearGradient colors={['#84bfdd', '#fff7cf']} style={styles.container}>
                <KeyboardAvoidingView behavior='height' style={styles.container}>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <View style={styles.content}>
                            <Text style={styles.title}>Reset Your Password</Text>

                            <View style={styles.whiteBox}>
                                <Text style={styles.infoText}>
                                    Enter your email address to receive a password reset link:
                                </Text>

                                <TextInput
                                    placeholder="Email Address"
                                    placeholderTextColor="#999"
                                    value={email}
                                    onChangeText={setEmail}
                                    style={styles.input}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />

                                <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                                    <Text style={styles.buttonText}>Send Reset Email</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                                    <Text style={{ color: '#000000', fontSize: 16, fontWeight: 'bold' }}>Back to Login</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContainer: { flexGrow: 1 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
    whiteBox: { backgroundColor: '#ffffff', padding: 20, borderRadius: 10, width: '100%', alignItems: 'center' },
    infoText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
    input: { width: '100%', padding: 10, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, marginBottom: 20 },
    button: { backgroundColor: '#5996b5', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 5 },
    buttonText: { color: '#ffffff', fontSize: 16 },
});
