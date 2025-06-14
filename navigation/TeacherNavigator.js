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
import TeacherEditClass from '../screens/teacher/TeacherEditClass';

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
            <Drawer.Screen name="TeacherEditClass" component={TeacherEditClass} options={{ drawerItemStyle: { display: 'none', title: "Edit Class" } }} />
        </Drawer.Navigator>
    );
}
