import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { db, secondaryAuth } from '../../firebase';
import { uploadImage, pickImage } from '../../utils/uploadImage';

export default function AddStudent({ navigation }) {
    const [form, setForm] = useState({
        name: '',
        age: '',
        email: '',
        password: '',
        profilePicture: null,
    });

    const handleAddStudent = async () => {
        if (!form.email || !form.password || !form.name || !form.age) {
            Alert.alert('All fields are required.');
            return;
        }

        try {
            const { user } = await createUserWithEmailAndPassword(secondaryAuth, form.email, form.password);

            let downloadURL = null;
            if (form.profilePicture) {
                downloadURL = await uploadImage(form.profilePicture, user.uid);
            }

            await setDoc(doc(db, 'users', user.uid), {
                name: form.name,
                age: parseInt(form.age),
                email: form.email,
                roles: ['student'],
                profilePicture: downloadURL || null,
            });
            Alert.alert('Student added!');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Error:', err.message);
        } finally {
            await secondaryAuth.signOut();
    }};

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Add New Student</Text>

            <TextInput style={styles.input} placeholder="Name" value={form.name} onChangeText={name => setForm({ ...form, name })} />
            <TextInput style={styles.input} placeholder="Age" keyboardType="numeric" value={form.age} onChangeText={age => setForm({ ...form, age })} />
            <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={email => setForm({ ...form, email })} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Password" secureTextEntry value={form.password} onChangeText={password => setForm({ ...form, password })} autoCapitalize="none" />

            <TouchableOpacity style={styles.imagePicker} onPress={async () => {
                const uri = await pickImage();
                if (uri) {
                    setForm(prev => ({ ...prev, profilePicture: uri }));
                }
            }}>
                <Text>{form.profilePicture ? 'Change Profile Picture' : 'Add Profile Picture (Optional)'}</Text>
            </TouchableOpacity>

            {form.profilePicture && (
                <Image source={{ uri: form.profilePicture }} style={styles.previewImage} />
            )}

            <Button title="Add Student" onPress={handleAddStudent} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
    label: { marginBottom: 6, fontWeight: '600' },
    imagePicker: { padding: 10, backgroundColor: '#ccc', borderRadius: 6, marginBottom: 10, alignItems: 'center' },
    previewImage: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 10 },
});