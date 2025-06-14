import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import StudentHome from '../screens/student/StudentHome';
import StudentAttendance from '../screens/student/StudentAttendance';
import StudentCalendar from '../screens/student/StudentCalendar';
import StudentEnroll from '../screens/student/StudentEnroll';
import Settings from '../screens/Settings';
import CustomDrawerContent from '../components/CustomDrawerContent';
import StudentEnrollEdit from '../screens/student/StudentEnrollEdit';
import EditProfile from '../screens/EditProfile';
import ChangeEmail from '../screens/ChangeEmail';
import ResetPassword from '../screens/ChangePassword';


const Drawer = createDrawerNavigator();

export default function StudentNavigator() {
    return (
        <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
            <Drawer.Screen name="StudentHome" component={StudentHome} options={{title: "Home"}}/>
            <Drawer.Screen name="StudentAttendance" component={StudentAttendance} options={{title: "My Attendance"}}/>
            <Drawer.Screen name="StudentCalendar" component={StudentCalendar} options={{title: "Calendar"}}/>
            <Drawer.Screen name="StudentEnroll" component={StudentEnroll} options={{title: "Enroll in Classes"}}/>
            <Drawer.Screen name="Settings" component={Settings} />
            <Drawer.Screen name="StudentEnrollEdit" component={StudentEnrollEdit} options={{ drawerItemStyle: { display: 'none' } }} /> 
            <Drawer.Screen name="EditProfile" component={EditProfile} options={{title: "Edit Profile", drawerItemStyle: { display: 'none' }}} />
            <Drawer.Screen name="ChangeEmail" component={ChangeEmail} options={{title: "Change Email", drawerItemStyle: { display: 'none' }}} />
            <Drawer.Screen name="ChangePassword" component={ResetPassword} options={{title: "Reset Password", drawerItemStyle: { display: 'none' }}} />
        </Drawer.Navigator>
    );
}
