import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import FacultyHome from '../screens/Faculty/FacultyHome';
import AssignedStudents from '../screens/Faculty/AssignedStudents';
import StudentLogs from '../screens/Faculty/StudentLogs';
import Planning from '../screens/Faculty/Planning';
import FacultyCertificates from '../screens/Faculty/FacultyCertificates';
import Settings from '../screens/Faculty/Settings';

const Drawer = createDrawerNavigator();

export default function FacultyDrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home" screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="Home" component={FacultyHome} />
      <Drawer.Screen name="Assigned Students" component={AssignedStudents} />
      <Drawer.Screen name="Student Logs" component={StudentLogs} />
      <Drawer.Screen name="Planning" component={Planning} />
      <Drawer.Screen name="Certificates" component={FacultyCertificates} />
      <Drawer.Screen name="Settings" component={Settings} />
    </Drawer.Navigator>
  );
}
