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
import EditTeacher from '../screens/admin/EditTeacher';
import EditClass from '../screens/admin/EditClass';
import AddStudent from '../screens/admin/AddStudent';
import EditStudent from '../screens/admin/EditStudent';
import EditEnrollment from '../screens/admin/EditEnrollment';
import EditProfile from '../screens/EditProfile';
import ChangeEmail from '../screens/ChangeEmail';
import ResetPassword from '../screens/ChangePassword';
import ManageSubjects from '../screens/admin/ManageSubjects';
import ManageClassType from '../screens/admin/ManageClassType';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="AdminHome" component={AdminHome} options={{title: "Home"}}/>
      <Drawer.Screen name="ManageClasses" component={ManageClasses} options={{title: "Manage Classes"}}/>
      <Drawer.Screen name="ManageTeachers" component={ManageTeachers} options={{title: "Manage Teachers"}}/>
      <Drawer.Screen name="ManageStudents" component={ManageStudents} options={{title: "Manage Students"}}/>
      <Drawer.Screen name="ManageSubjects" component={ManageSubjects} options={{title: "Manage Subjects"}}/>
      <Drawer.Screen name="ManageClassType" component={ManageClassType} options={{title: "Manage Class Types"}}/>
      <Drawer.Screen name="EnrollStudents" component={EnrollStudents} options={{title: "Enroll Students"}}/>
      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="Settings" component={Settings}/>
      <Drawer.Screen name="AddTeacher" component={AddTeacherScreen} options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="AddClass" component={AddClass} options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="EditTeacher" component={EditTeacher} options={{ drawerItemStyle: { display: 'none' } }}/>
      <Drawer.Screen name="EditClass" component={EditClass} options={{ drawerItemStyle: { display: 'none' } }}/> 
      <Drawer.Screen name="AddStudent" component={AddStudent} options={{ drawerItemStyle: { display: 'none' } }}/>  
      <Drawer.Screen name="EditStudent" component={EditStudent} options={{ drawerItemStyle: { display: 'none' } }}/>   
      <Drawer.Screen name="EditEnrollment" component={EditEnrollment} options={{ drawerItemStyle: { display: 'none' } }}/>
      <Drawer.Screen name="EditProfile" component={EditProfile} options={{title: "Edit Profile", drawerItemStyle: { display: 'none' }}} />
      <Drawer.Screen name="ChangeEmail" component={ChangeEmail} options={{title: "Change Email", drawerItemStyle: { display: 'none' }}} />
      <Drawer.Screen name="ChangePassword" component={ResetPassword} options={{title: "Reset Password", drawerItemStyle: { display: 'none' }}} />

    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
