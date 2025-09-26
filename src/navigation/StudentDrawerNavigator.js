// src/navigation/StudentDrawerNavigator.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import StudentHome from '../screens/Student/StudentHome';
import ProfileScreen from '../screens/Student/ProfileScreen';
import InternshipList from '../screens/Student/InternshipList';
import Applications from '../screens/Student/Applications';
import Logbooks from '../screens/Student/Logbooks';
import Certificates from '../screens/Student/Certificates';
import Settings from '../screens/Student/Settings';

const Drawer = createDrawerNavigator();

export default function StudentDrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="StudentHome" screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="StudentHome" component={StudentHome} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Internships" component={InternshipList} />
      <Drawer.Screen name="Applications" component={Applications} />
      <Drawer.Screen name="Logbooks" component={Logbooks} />
      <Drawer.Screen name="Certificates" component={Certificates} />
      <Drawer.Screen name="Settings" component={Settings} />
    </Drawer.Navigator>
  );
}
