// src/navigation/StudentDrawerNavigator.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import StudentHome from '../screens/Student/StudentHome';
import FacultyCoordinator from '../screens/Student/FacultyCoordinator';
import InternshipList from '../screens/Student/InternshipList';
import Applications from '../screens/Student/Applications';
import Logbooks from '../screens/Student/Logbooks';
import Certificates from '../screens/Student/Certificates';
import ProfileScreen from '../screens/Student/ProfileScreen';

const Drawer = createDrawerNavigator();

export default function StudentDrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home" screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="Home" component={StudentHome} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Faculty Coordinator" component={FacultyCoordinator} />
      <Drawer.Screen name="Internships" component={InternshipList} />
      <Drawer.Screen name="Applications" component={Applications} />
      <Drawer.Screen name="Logbooks" component={Logbooks} />
      <Drawer.Screen name="Certificates" component={Certificates} />
    </Drawer.Navigator>
  );
}
