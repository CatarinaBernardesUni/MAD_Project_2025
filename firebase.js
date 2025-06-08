// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getFirestore } from 'firebase/firestore'; 
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGStG2VO6lwvo76Ta3yIawPA6CEkRmyfU",
  authDomain: "mad-project-2025.firebaseapp.com",
  projectId: "mad-project-2025",
  storageBucket: "mad-project-2025.firebasestorage.app",
  messagingSenderId: "94415246820",
  appId: "1:94415246820:web:3dc4669735ef16a2f623f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 
console.log('📚 Firestore DB initialized:', db);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const storage = getStorage(app);
export { storage };