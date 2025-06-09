import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TeacherHome from '../screens/teacher/TeacherHome';
import TeacherCalendar from '../screens/teacher/TeacherCalendar';
import TeacherDashboard from '../screens/teacher/TeacherDashboard';
import TeacherSubjects from '../screens/teacher/TeacherSubjects';
import Settings from '../screens/Settings';
import CustomDrawerContent from '../components/CustomDrawerContent';
import AddClass from '../screens/admin/AddClass';
import TeacherAddClass from '../screens/teacher/TeacherAddClass'; 


const Drawer = createDrawerNavigator();

export default function TeacherNavigator() {
    return (
        <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
            <Drawer.Screen name="TeacherHome" component={TeacherHome} />
            <Drawer.Screen name="TeacherCalendar" component={TeacherCalendar} />
            <Drawer.Screen name="TeacherDashboard" component={TeacherDashboard} />
            <Drawer.Screen name="TeacherSubjects" component={TeacherSubjects} />
            <Drawer.Screen name="Settings" component={Settings} />
            <Drawer.Screen name="AddClass" component={AddClass} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="TeacherAddClass" component={TeacherAddClass} options={{ drawerItemStyle: { display: 'none' } }} />
            
        </Drawer.Navigator>
    );
}
