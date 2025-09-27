// src/screens/Student/Settings.js
import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function Settings() {
  const { logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>⚙️ Settings</Text>
      <Text style={styles.info}>This section is under construction. Stay tuned for more features! 🚧</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#f5f8ff' },
  heading: { fontSize: 22, fontWeight: 'bold', color: "#0b7cff", marginBottom: 10 },
  info: { color: "#555", fontSize: 15, marginBottom: 20, textAlign: "center" }
});
