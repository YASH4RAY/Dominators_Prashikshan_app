// src/navigation/RootNavigator.js
import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleSelectScreen from '../screens/Auth/RoleSelectScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import LoginScreen from '../screens/Auth/LoginScreen';

// Dashboards / Navigators
import StudentDrawerNavigator from './StudentDrawerNavigator';
import CollegeDrawerNavigator from './CollegeDrawerNavigator';
import CompanyDrawerNavigator from './CompanyDrawerNavigator';
import FacultyDrawerNavigator from './FacultyDrawerNavigator';

import { AuthContext } from '../context/AuthContext';
import { ActivityIndicator, View, Text } from 'react-native';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, role, initializing } = useContext(AuthContext);

  // Show loader if auth state is still initializing OR user exists but role not loaded
  if (initializing || (user && role === null)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Loading…</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          {/* First screen for non-logged in users */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          {role === 'student' && (
            <Stack.Screen name="Student" component={StudentDrawerNavigator} />
          )}
          {role === 'college' && (
            <Stack.Screen name="CollegeDashboard" component={CollegeDrawerNavigator} />
          )}
          {role === 'company' && (
            <Stack.Screen name="CompanyDashboard" component={CompanyDrawerNavigator} />
          )}
          {role === 'faculty' && (
           <Stack.Screen name="FacultyDashboard" component={FacultyDrawerNavigator} />
          )}
        </>
      )}
    </Stack.Navigator>
  );
}
