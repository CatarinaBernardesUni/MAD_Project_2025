import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHome from '../screens/admin/AdminHome';
import ManageClasses from '../screens/admin/ManageClasses';
import ManageTeachers from '../screens/admin/ManageTeachers';
import ManageStudents from '../screens/admin/ManageStudents';
import EnrollStudents from '../screens/admin/EnrollStudents';
import Dashboard from '../screens/admin/Dashboard';

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