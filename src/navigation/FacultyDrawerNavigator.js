import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import FacultyProfile from "../screens/Faculty/FacultyProfile";
import AssignedStudents from "../screens/Faculty/AssignedStudents";
import StudentLogs from "../screens/Faculty/StudentLogs";
import Planning from "../screens/Faculty/Planning";
import FacultyCertificates from "../screens/Faculty/FacultyCertificates";

const Drawer = createDrawerNavigator();

export default function FacultyDrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="FacultyProfile" screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="FacultyProfile" component={FacultyProfile} />
      <Drawer.Screen name="Assigned Students" component={AssignedStudents} />
      <Drawer.Screen name="Student Logs" component={StudentLogs} />
      <Drawer.Screen name="Planning" component={Planning} />
      <Drawer.Screen name="Certificates" component={FacultyCertificates} />
    </Drawer.Navigator>
  );
}

