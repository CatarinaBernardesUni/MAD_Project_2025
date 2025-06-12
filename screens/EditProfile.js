import React, { useEffect, useState } from 'react';
import {
    View, TextInput, Button, Alert, Image, TouchableOpacity, ScrollView, StyleSheet, Text
} from 'react-native';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, updateEmail, sendEmailVerification } from 'firebase/auth';
import { pickImage, uploadImage } from '../utils/uploadImage';

export default function EditProfile({ navigation }) {
    const user = auth.currentUser;
    const userId = user?.uid;
    const [form, setForm] = useState(null);
    const [pictureChanged, setPictureChanged] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const snap = await getDoc(doc(db, 'users', userId));
                if (snap.exists()) {
                    const data = snap.data();
                    setForm({
                        name: data.name || '',
                        age: data.age?.toString() || '',
                        email: data.email || '',
                        profilePicture: data.profilePicture || null,
                    });
                }
                setLoading(false);
            } catch (err) {
                Alert.alert('Error', 'Could not load user data');
            }
        };

        loadUser();
    }, [userId]);

const handleUpdate = async () => {
  if (!form.name || !form.age || !form.email) {
    Alert.alert('Please fill all required fields.');
    return;
  }

  try {
    const userRef = doc(db, 'users', userId);
    let finalImageUrl = form.profilePicture;

    if (pictureChanged && form.profilePicture) {
      finalImageUrl = await uploadImage(form.profilePicture, userId);
    }

    if (form.email !== user.email) {
      await user.reload();
      await updateEmail(user, form.email);
    }

    await updateDoc(userRef, {
      name: form.name,
      age: parseInt(form.age),
      email: form.email,
      profilePicture: finalImageUrl || null,
    });

    await updateProfile(user, {
      displayName: form.name,
      photoURL: finalImageUrl || null,
    });

    Alert.alert('Profile updated!');
    navigation.goBack();
  } catch (err) {
    if (err.code === 'auth/requires-recent-login') {
      Alert.alert(
        'Security Check',
        'Please log in again to change your email.'
      );
    } else {
      Alert.alert('Update failed', err.message);
    }
  }
};

    if (loading || !form) return <Text style={{ padding: 20 }}>Loading...</Text>;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={form.name}
                onChangeText={name => setForm({ ...form, name })}
            />
            <TextInput
                style={styles.input}
                placeholder="Age"
                keyboardType="numeric"
                value={form.age}
                onChangeText={age => setForm({ ...form, age })}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={form.email}
                onChangeText={email => setForm({ ...form, email })}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TouchableOpacity
                style={styles.imagePicker}
                onPress={async () => {
                    const uri = await pickImage();
                    if (uri) {
                        setForm(prev => ({ ...prev, profilePicture: uri }));
                        setPictureChanged(true);
                    }
                }}
            >
                <Text>{form.profilePicture ? 'Change Profile Picture' : 'Add Profile Picture'}</Text>
            </TouchableOpacity>

            {form.profilePicture && (
                <Image source={{ uri: form.profilePicture }} style={styles.previewImage} />
            )}

            <Button title="Update Profile" onPress={handleUpdate} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8 },
    imagePicker: { padding: 10, backgroundColor: '#ccc', marginBottom: 10, alignItems: 'center' },
    previewImage: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center' },
});