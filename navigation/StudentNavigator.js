import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import StudentHome from '../screens/student/StudentHome';
import StudentAttendance from '../screens/student/StudentAttendance';
import StudentCalendar from '../screens/student/StudentCalendar';
import StudentEnroll from '../screens/student/StudentEnroll';
import Settings from '../screens/Settings';
import CustomDrawerContent from '../components/CustomDrawerContent';

const Drawer = createDrawerNavigator();

export default function StudentNavigator() {
    return (
        <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
            <Drawer.Screen name="StudentHome" component={StudentHome} />
            <Drawer.Screen name="StudentAttendance" component={StudentAttendance} />
            <Drawer.Screen name="StudentCalendar" component={StudentCalendar} />
            <Drawer.Screen name="StudentEnroll" component={StudentEnroll} />
            <Drawer.Screen name="Settings" component={Settings} />
        </Drawer.Navigator>
    );
}
