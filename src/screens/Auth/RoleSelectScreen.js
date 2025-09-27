// src/screens/Auth/RoleSelectScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function RoleSelectScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.headerGradient}>
        <Text style={styles.title}>Sign up / Login as</Text>
      </View>
      <View style={styles.card}>
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
          <Text style={styles.linkText}>Already registered? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 0,
  },
  headerGradient: {
    width: '100%',
    height: 110,
    backgroundColor: 'linear-gradient(90deg, #0b7cff 0%, #00c6fb 100%)',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 18,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: -30,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  card: {
    marginTop: -30,
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e3eaf2',
  },
  button: {
    width: '100%',
    padding: 16,
    backgroundColor: '#0b7cff',
    borderRadius: 10,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#0b7cff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  link: {
    marginTop: 18,
    alignItems: 'center',
  },
  linkText: {
    color: '#0b7cff',
    fontWeight: '600',
    fontSize: 15,
  },
});
