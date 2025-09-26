import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import CompanyHome from '../screens/Company/CompanyHome';
import PostInternship from '../screens/Company/PostInternship';
import ManageInternships from '../screens/Company/ManageInternships';
import Applications from '../screens/Company/Applications';
import Ratings from '../screens/Company/Ratings';
import Settings from '../screens/Company/Settings';

const Drawer = createDrawerNavigator();

export default function CompanyDrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home" screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="Home" component={CompanyHome} />
      <Drawer.Screen name="Post Internship" component={PostInternship} />
      <Drawer.Screen name="Manage Internships" component={ManageInternships} />
      <Drawer.Screen name="Applications" component={Applications} />
      <Drawer.Screen name="Ratings" component={Ratings} />
      <Drawer.Screen name="Settings" component={Settings} />
    </Drawer.Navigator>
  );
}
