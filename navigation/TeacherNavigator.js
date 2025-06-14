import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TeacherHome from '../screens/teacher/TeacherHome';
import TeacherCalendar from '../screens/teacher/TeacherCalendar';
import TeacherDashboard from '../screens/teacher/TeacherDashboard';
import TeacherSubjects from '../screens/teacher/TeacherSubjects';
import Settings from '../screens/Settings';
import CustomDrawerContent from '../components/CustomDrawerContent';
import TeacherAddClass from '../screens/teacher/TeacherAddClass'; 
import TeacherMarkAttendance from '../screens/teacher/TeacherMarkAttendance';
import EditProfile from '../screens/EditProfile';
import NotificationSettings from '../screens/NotificationSettings';
import ChangeEmail from '../screens/ChangeEmail';
import ResetPassword from '../screens/ChangePassword';

const Drawer = createDrawerNavigator();

export default function TeacherNavigator() {
    return (
        <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
            <Drawer.Screen name="TeacherHome" component={TeacherHome} options={{title: "Home"}}/>
            <Drawer.Screen name="TeacherCalendar" component={TeacherCalendar} options={{title: "Calendar"}}/>
            <Drawer.Screen name="TeacherDashboard" component={TeacherDashboard} options={{title: "Dashboard"}}/>
            <Drawer.Screen name="TeacherSubjects" component={TeacherSubjects} options={{title: "My Subjects"}}/>
            <Drawer.Screen name="Settings" component={Settings} />
            <Drawer.Screen name="TeacherAddClass" component={TeacherAddClass} options={{ drawerItemStyle: { display: 'none', title: "Manage Classes" } }} />
            <Drawer.Screen name="TeacherMarkAttendance" component={TeacherMarkAttendance} options={{ drawerItemStyle: { display: 'none', title: "Mark Attendance" } }} />
            <Drawer.Screen name="EditProfile" component={EditProfile} options={{title: "Edit Profile", drawerItemStyle: { display: 'none' }}} />
            <Drawer.Screen name="NotificationSettings" component={NotificationSettings} options={{title: "Notification Settings", drawerItemStyle: { display: 'none' }}} />
            <Drawer.Screen name="ChangeEmail" component={ChangeEmail} options={{title: "Change Email", drawerItemStyle: { display: 'none' }}} />
            <Drawer.Screen name="ChangePassword" component={ResetPassword} options={{title: "Reset Password", drawerItemStyle: { display: 'none' }}} />
        </Drawer.Navigator>
    );
}
