import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { uploadImage, pickImage } from '../../utils/uploadImage';

export default function AddTeacherScreen({ navigation }) {
    const [form, setForm] = useState({
        name: '',
        age: '',
        email: '',
        password: '',
        profilePicture: null,
        subjects: [],
    });

    const [availableSubjects, setAvailableSubjects] = useState([]);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'subjects'));
                const subjectNames = snapshot.docs.map(doc => doc.data().name);
                setAvailableSubjects(subjectNames);
            } catch (error) {
                console.error('Error fetching subjects:', error);
                Alert.alert('Error fetching subjects');
            }
        };

        fetchSubjects();
    }, []);

    const toggleSubject = (subject) => {
        const newSubjects = form.subjects.includes(subject)
            ? form.subjects.filter(s => s !== subject)
            : [...form.subjects, subject];
        setForm({ ...form, subjects: newSubjects });
    };

    const handleAddTeacher = async () => {
        if (!form.email || !form.password || !form.name || !form.age) {
            Alert.alert('All fields are required.');
            return;
        }

        try {
            const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);

            let downloadURL = null;
            if (form.profilePicture) {
                downloadURL = await uploadImage(form.profilePicture, user.uid);
            }

            await setDoc(doc(db, 'users', user.uid), {
                name: form.name,
                age: parseInt(form.age),
                email: form.email,
                roles: ['teacher'],
                subjects: form.subjects,
                profilePicture: downloadURL || null,
            });
            Alert.alert('Teacher added!');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Error:', err.message);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Add New Teacher</Text>

            <TextInput style={styles.input} placeholder="Name" value={form.name} onChangeText={name => setForm({ ...form, name })} />
            <TextInput style={styles.input} placeholder="Age" keyboardType="numeric" value={form.age} onChangeText={age => setForm({ ...form, age })} />
            <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={email => setForm({ ...form, email })} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Password" secureTextEntry value={form.password} onChangeText={password => setForm({ ...form, password })} autoCapitalize="none" />

            <Text style={styles.label}>Subjects:</Text>
            <View style={styles.subjectContainer}>
                {availableSubjects.map(subject => (
                    <TouchableOpacity
                        key={subject}
                        style={[
                            styles.subjectButton,
                            form.subjects.includes(subject) && styles.subjectSelected
                        ]}
                        onPress={() => toggleSubject(subject)}
                    >
                        <Text>{subject}</Text>
                    </TouchableOpacity>
                ))}
            </View>

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

            <Button title="Add Teacher" onPress={handleAddTeacher} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
    label: { marginBottom: 6, fontWeight: '600' },
    subjectContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, gap: 8 },
    subjectButton: { padding: 10, backgroundColor: '#eee', borderRadius: 6 },
    subjectSelected: { backgroundColor: '#aaf' },
    imagePicker: { padding: 10, backgroundColor: '#ccc', borderRadius: 6, marginBottom: 10, alignItems: 'center' },
    previewImage: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 10 },
});
