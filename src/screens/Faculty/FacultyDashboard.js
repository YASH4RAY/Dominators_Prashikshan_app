// src/screens/Faculty/FacultyDashboard.js
import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function FacultyDashboard() {
  const { user, logout } = useContext(AuthContext);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Faculty Advisor Dashboard</Text>
      <Text>Welcome, {user?.email}</Text>
      <Text style={{marginTop:8}}>You can track student logs, courses and provide planning.</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
const styles = StyleSheet.create({container:{flex:1,alignItems:'center',justifyContent:'center'},title:{fontSize:20,fontWeight:'700'}});
