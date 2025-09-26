// src/screens/College/CollegeDashboard.js
import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function CollegeDashboard() {
  const { user, logout } = useContext(AuthContext);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>College Admin Dashboard</Text>
      <Text>Welcome, {user?.email}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
const styles = StyleSheet.create({container:{flex:1,alignItems:'center',justifyContent:'center'},title:{fontSize:20,fontWeight:'700'}});
