import * as ImagePicker from 'expo-image-picker';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Alert } from 'react-native';

export const pickImage = async () => {
    try {

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow access to your gallery.');
            return null;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypes,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.4,
        });

        if (!result.canceled) {
            return result.assets[0].uri;
        }
        return null
    } catch (error) {
        Alert.alert(
            'Image Selection Failed',
            'An error occurred while selecting the image. Please try again.'
        );
        return null
    }
};

export const uploadImage = async (uri, uid) => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();

        const timestamp = Date.now();
        const imageRef = ref(storage, `profilePictures/${uid}-${timestamp}.jpg`);

        await uploadBytes(imageRef, blob);
        return await getDownloadURL(imageRef);
    } catch (err) {
        Alert.alert(
            'Upload Failed',
            'We could not upload your image. Please check your connection and try again.'
        );
    }
};
