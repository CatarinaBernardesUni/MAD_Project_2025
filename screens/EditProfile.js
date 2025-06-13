import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { pickImage, uploadImage } from '../utils/uploadImage';

export default function EditProfile({ navigation, route }) {
  const user = auth.currentUser;

  if (!user) {
    Alert.alert('Not authenticated');
    return null;
  }

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
            email: data.email || '',
            profilePicture: data.profilePicture || '' 
          });
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        Alert.alert('Error!', 'Unable to load user profile.');
        setLoading(false);
      }
    };
    loadUser();
  }, [userId]);

  const handleUpdate = async () => {
    console.log('handleUpdate called');

    if (!form.name || !form.age) {
      Alert.alert('Please fill all required fields.');
      return;
    }

    if (form.email !== user.email) {
      Alert.alert(
        'Security Check',
        'Please reauthenticate before changing your email.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Passing new email to ReAuthScreen
              navigation.navigate('ReAuthScreen', { newEmail: form.email });
            },
          },
        ],
        { cancelable: false },
      );
      return;
    }

    try {
      // Update Firestore first
      const userRef = doc(db, 'users', userId);
      let finalImageUrl = form.profilePicture;

      if (pictureChanged && form.profilePicture) {
        finalImageUrl = await uploadImage(form.profilePicture, userId);
      }

      await updateDoc(userRef, {
        name: form.name,
        age: parseInt(form.age),
        email: form.email,
        profilePicture: finalImageUrl,
      });

      // Update Auth profile
      await updateProfile(user, {
        displayName: form.name,
        photoURL: finalImageUrl,
      });

      Alert.alert('Profile updated!', '');
      navigation.goBack();

    } catch (err) {
      console.error(err);
      Alert.alert('Update failed!', err.message);
    }
  };

  if (loading) return <Text style={{ padding: 20 }}>Loading...</Text>;
  if (!form) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={form.name}
        onChangeText={(name) => setForm({ ...form, name })}
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        keyboardType="numeric"
        value={form.age}
        onChangeText={(age) => setForm({ ...form, age })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        onChangeText={(email) => setForm({ ...form, email })}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TouchableOpacity
        style={styles.imagePicker}
        onPress={async () => {
          const uri = await pickImage();
          if (uri) {
            setForm((prev) => ({
              ...prev,
              profilePicture: uri,
            }));
            setPictureChanged(true);
          }
        }}>
        <Text>
          {form.profilePicture ? 'Change Profile Picture' : 'Add Profile Picture'}
        </Text>
      </TouchableOpacity>

      {form.profilePicture ? (
        <Image
          source={{ uri: form.profilePicture }}
          style={styles.previewImage}
        />
      ) : null}

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
