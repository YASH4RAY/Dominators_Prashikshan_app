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
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#0b7cff',
        drawerLabelStyle: { fontSize: 16, fontWeight: '600' },
      }}
    >
      <Drawer.Screen name="Home" component={StudentHome} options={{ drawerLabel: '🏠 Home' }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ drawerLabel: '👤 Profile' }} />
      <Drawer.Screen name="Faculty Coordinator" component={FacultyCoordinator} options={{ drawerLabel: '👨‍🏫 Faculty Coordinator' }} />
      <Drawer.Screen name="Internships" component={InternshipList} options={{ drawerLabel: '💼 Internships' }} />
      <Drawer.Screen name="Applications" component={Applications} options={{ drawerLabel: '📄 Applications' }} />
      <Drawer.Screen name="Logbooks" component={Logbooks} options={{ drawerLabel: '📔 Logbooks' }} />
      <Drawer.Screen name="Certificates" component={Certificates} options={{ drawerLabel: '🎓 Certificates' }} />
    </Drawer.Navigator>
  );
}
