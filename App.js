import React, { useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, Alert } from 'react-native';


import useFirebaseUser from './hooks/useFirebaseUser';

import AuthStack from './navigation/AuthStack';
import AdminNavigator from './navigation/AdminNavigator';
import TeacherNavigator from './navigation/TeacherNavigator';
import StudentNavigator from './navigation/StudentNavigator';


export default function App() {
  const { user, role, loading } = useFirebaseUser();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  console.log("user:", user);
  console.log("role:", role);

  let Navigator;

  if (!user) {
    Navigator = AuthStack;
  } else if (role === 'admin') {
    Navigator = AdminNavigator;
  } else if (role === 'teacher') {
    Navigator = TeacherNavigator;
  } else if (role === 'student') {
    Navigator = StudentNavigator;
  } else {
    Navigator = AuthStack; 
  }

  return (
    <NavigationContainer>     
      <Navigator />
    </NavigationContainer>
  );
}