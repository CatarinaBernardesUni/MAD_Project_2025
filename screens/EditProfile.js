import React, { useEffect, useState } from 'react';
import { View, TextInput, Alert, Image, TouchableOpacity, ScrollView, StyleSheet, Text, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { pickImage, uploadImage } from '../utils/uploadImage';

export default function EditProfile({ navigation }) {
  const user = auth.currentUser;
  const userId = user.uid;

  const [form, setForm] = useState(null);
  const [pictureChanged, setPictureChanged] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const snapshot = await getDoc(doc(db, 'users', userId));

        if (snapshot.exists()) {
          const data = snapshot.data();
          setForm({
            name: data.name || '',
            age: data.age?.toString() || '',
            profilePicture: data.profilePicture || ''
          });
        }
        setLoading(false);
      } catch (err) {
        Alert.alert(
          'Error Loading Profile',
          'Something went wrong while loading the user profile. Please check your internet connection or try again later.'
        );
        setLoading(false);
      }
    };
    loadUser();
  }, [userId]);

  const handleUpdate = async () => {
    if (!form.name || !form.age) {
      Alert.alert(
        'Incomplete Form',
        'Please fill in both your name and age to update your profile.'
      );
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      let finalImageUrl = form.profilePicture;

      if (pictureChanged && form.profilePicture) {
        finalImageUrl = await uploadImage(form.profilePicture, userId);
      }

      await updateDoc(userRef, {
        name: form.name,
        age: parseInt(form.age),
        profilePicture: finalImageUrl,
      });

      await updateProfile(user, {
        displayName: form.name,
        photoURL: finalImageUrl,
      });

      Alert.alert(
        'Profile Updated',
        'Your profile has been successfully updated.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

    } catch (err) {
      Alert.alert(
        'Update Failed',
        'We were unable to update your profile. Please try again later.'
      );
    }
  };

  if (loading) return <Text style={{ padding: 20 }}>Loading...</Text>;
  if (!form) return null;

  return (
    <LinearGradient colors={['#84bfdd', '#fff7cf']} style={styles.container}>
      <KeyboardAvoidingView
        behavior='height'
        keyboardVerticalOffset={60}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Edit Profile</Text>

          <Text style={styles.label}>Name:</Text>
          <View style={styles.inputContainer}>

            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#000000"
              value={form.name}
              onChangeText={(name) => setForm({ ...form, name })}
            />
          </View>

          <Text style={styles.label}>Age:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Age"
              placeholderTextColor="#000000"
              keyboardType="numeric"
              value={form.age}
              onChangeText={(age) => setForm({ ...form, age })}
            />
          </View>

          <TouchableOpacity
            style={[styles.imagePicker, { backgroundColor: 'rgba(255, 255, 255, 0.6)' }]}
            onPress={async () => {
              const uri = await pickImage();
              if (uri) {
                setForm((prev) => ({ ...prev, profilePicture: uri }));
                setPictureChanged(true);
              }
            }}
          >
            <Text style={{ color: '#000000' }}>
              {form.profilePicture ? 'Change Profile Picture' : 'Add Profile Picture'}
            </Text>
          </TouchableOpacity>

          {form.profilePicture && (
            <Image
              source={{ uri: form.profilePicture }}
              style={styles.previewImage}
            />
          )}

          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Update Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginTop: 40 }}>
            <Text style={{ color: '#000000', fontSize: 16, textDecorationLine: 'underline' }}>Back to Settings</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 100,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
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
  imagePicker: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginBottom: 10,
    alignItems: 'center',
    width: '100%',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 15,
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
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  label: {
    color: '#000000',
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '500',
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
});
