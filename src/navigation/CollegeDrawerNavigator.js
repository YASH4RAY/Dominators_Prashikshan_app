import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Screens
import CollegeHome from '../screens/College/CollegeHome';
import StudentList from '../screens/College/StudentList';
import InternshipApprovals from '../screens/College/InternshipApprovals';
import CollegeLogbooks from '../screens/College/CollegeLogbooks';
import CollegeCertificates from '../screens/College/CollegeCertificates';
import CollegeCourses from '../screens/College/CollegeCourses';
import Settings from '../screens/College/Settings';

const Drawer = createDrawerNavigator();

export default function CollegeDrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        drawerPosition: 'right',   // 👈 drawer opens from right side
      }}
    >
      <Drawer.Screen name="Home" component={CollegeHome} />
      <Drawer.Screen name="Students" component={StudentList} />
      <Drawer.Screen name="Internship Approvals" component={InternshipApprovals} />
      <Drawer.Screen name="Logbooks" component={CollegeLogbooks} />
      <Drawer.Screen name="Certificates" component={CollegeCertificates} />
      <Drawer.Screen name="Courses" component={CollegeCourses} />
      <Drawer.Screen name="Settings" component={Settings} />
    </Drawer.Navigator>
  );
}
