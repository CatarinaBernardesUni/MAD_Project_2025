import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHome from '../screens/AdminHome';
import ManageClasses from '../screens/ManageClasses';
import ManageTeachers from '../screens/ManageTeachers';
import ManageStudents from '../screens/ManageStudents';
import EnrollStudents from '../screens/EnrollStudents';
import Dashboard from '../screens/Dashboard';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="AdminHome">
      <Stack.Screen name="AdminHome" component={AdminHome} options={{ headerShown: false }} />
      <Stack.Screen name="ManageClasses" component={ManageClasses} />
      <Stack.Screen name="ManageTeachers" component={ManageTeachers} />
      <Stack.Screen name="ManageStudents" component={ManageStudents} />
      <Stack.Screen name="EnrollStudents" component={EnrollStudents} />
      <Stack.Screen name="Dashboard" component={Dashboard} />            
    </Stack.Navigator>
  );
};

export default StackNavigator;