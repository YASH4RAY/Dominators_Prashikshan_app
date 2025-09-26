// src/screens/Faculty/Settings.js
import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function Settings() {
  const { logout } = useContext(AuthContext);

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Text>Faculty Settings</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
