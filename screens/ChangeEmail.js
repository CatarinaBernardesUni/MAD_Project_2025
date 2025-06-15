import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../firebase';
import { EmailAuthProvider, reauthenticateWithCredential, verifyBeforeUpdateEmail } from 'firebase/auth';

export default function ChangeEmail({ navigation }) {
    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [step, setStep] = useState('enterEmail');
    const [loading, setLoading] = useState(false);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const handleNext = () => {
        if (!newEmail.trim() || !validateEmail(newEmail)) {
             Alert.alert('Validation Error', 'Please enter a valid email address.');
            return;
        }
        setStep('reauthenticate');
    };

    const handleReAuthAndChangeEmail = async () => {
        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            // Reauthenticate
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Send verification and update email
            await verifyBeforeUpdateEmail(user, newEmail);

            Alert.alert(
                'Verify Your New Email',
                `A verification link has been sent to ${newEmail}. Please verify it to complete the update and then log in again.`,
                [{
                    text: 'OK', onPress: async () => {
                        try {
                            await auth.signOut();
                        } catch (signOutError) {
                            Alert.alert('Sign Out Error', 'An error occurred while signing out. Please try again.');
                        }
                    },
                }]
            );
        } catch (error) {
            Alert.alert('Email Update Failed', 'An unexpected error occurred while updating your email. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#84bfdd', '#fff7cf']} style={styles.container}>
            <KeyboardAvoidingView behavior='height' style={styles.innerContainer}>
                {step === 'enterEmail' ? (
                    <>
                        <Text style={styles.title}>Enter New Email Address</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="New Email"
                                placeholderTextColor="#000000"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={newEmail}
                                onChangeText={setNewEmail}
                                editable={!loading}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleNext}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>Next</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginTop: 40 }}>
                            <Text style={{ color: '#000000', fontSize: 16, textDecorationLine: 'underline' }}>Back to Settings</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.title}>Reauthenticate to Confirm</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Current Password"
                                placeholderTextColor="#000000"
                                secureTextEntry
                                autoCapitalize="none"
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                editable={!loading}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleReAuthAndChangeEmail}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Updating...' : 'Confirm Email Change'}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 40,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 25,
        paddingHorizontal: 15,
        marginBottom: 20,
        width: '100%',
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        color: '#000000',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#5996b5',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
    },
});
