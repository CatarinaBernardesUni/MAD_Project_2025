import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AdminHome from '../screens/admin/AdminHome';
import ManageClasses from '../screens/admin/ManageClasses';
import ManageTeachers from '../screens/admin/ManageTeachers';
import ManageStudents from '../screens/admin/ManageStudents';
import EnrollStudents from '../screens/admin/EnrollStudents';
import Dashboard from '../screens/admin/Dashboard';
import Settings from '../screens/Settings';
import CustomDrawerContent from '../components/CustomDrawerContent';
import AddTeacherScreen from '../screens/admin/AddTeacherScreen';
import AddClass from '../screens/admin/AddClass';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="AdminHome" component={AdminHome} />
      <Drawer.Screen name="ManageClasses" component={ManageClasses} />
      <Drawer.Screen name="ManageTeachers" component={ManageTeachers} />
      <Drawer.Screen name="ManageStudents" component={ManageStudents} />
      <Drawer.Screen name="EnrollStudents" component={EnrollStudents} />
      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="Settings" component={Settings}/>
      <Drawer.Screen name="AddTeacher" component={AddTeacherScreen} options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="AddClass" component={AddClass} options={{ drawerItemStyle: { display: 'none' } }} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
