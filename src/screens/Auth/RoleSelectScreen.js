// src/screens/Auth/RoleSelectScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function RoleSelectScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign up / Login as</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register', { role: 'student' })}>
        <Text style={styles.btnText}>Student</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register', { role: 'college' })}>
        <Text style={styles.btnText}>College Admin</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register', { role: 'company' })}>
        <Text style={styles.btnText}>Company Admin</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register', { role: 'faculty' })}>
        <Text style={styles.btnText}>Faculty Advisor</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
        <Text style={{color:'#333'}}>Already registered? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:'center',alignItems:'center',padding:20},
  title:{fontSize:22,fontWeight:'700',marginBottom:30},
  button:{width:'100%',padding:14,backgroundColor:'#0b7cff',borderRadius:8,marginBottom:12,alignItems:'center'},
  btnText:{color:'#fff',fontWeight:'600'},
  link:{marginTop:20}
});
