// src/screens/Auth/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { auth, db } from '../../config/firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('student'); // default selection
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) return Alert.alert('Missing fields', 'Please provide email and password');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const uid = cred.user.uid;

      // fetch stored role from Firestore to validate
      const snap = await getDoc(doc(db, 'users', uid));
      if (!snap.exists()) {
        Alert.alert('Account incomplete', 'No profile found. Please register.');
        await auth.signOut();
        setLoading(false);
        return;
      }

      const actualRole = snap.data().role;

      if (selectedRole && selectedRole !== actualRole) {
        Alert.alert(
          'Role mismatch',
          `You selected "${selectedRole}" but this account is registered as "${actualRole}". You will be redirected to your actual dashboard.`
        );
      }
      // AuthContext's onAuthStateChanged will handle navigation afterwards.
    } catch (err) {
      Alert.alert('Login error', err.message);
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerGradient}>
        <Text style={styles.head}>Login</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Select role (for login):</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={selectedRole}
            onValueChange={(itemValue) => setSelectedRole(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Student" value="student" />
            <Picker.Item label="College Admin" value="college" />
            <Picker.Item label="Company Admin" value="company" />
            <Picker.Item label="Faculty Advisor" value="faculty" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.btn} onPress={onLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.registerSection}>
        <Text style={styles.registerLabel}>New user? Register as:</Text>
        <View style={styles.registerRow}>
          <TouchableOpacity style={styles.regBtn} onPress={() => navigation.navigate('Register', { role: 'student' })}>
            <Text style={styles.regText}>Student</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.regBtn} onPress={() => navigation.navigate('Register', { role: 'faculty' })}>
            <Text style={styles.regText}>Faculty</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.regBtn} onPress={() => navigation.navigate('Register', { role: 'college' })}>
            <Text style={styles.regText}>College Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.regBtn} onPress={() => navigation.navigate('Register', { role: 'company' })}>
            <Text style={styles.regText}>Company Admin</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f6ff', // softer background
    justifyContent: 'flex-start',
  },
  headerGradient: {
    width: '100%',
    height: 130,
    backgroundColor: '#0b7cff', // fallback
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: -40,
    shadowColor: '#0b7cff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  head: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  card: {
    marginTop: -40,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 0,
  },
  label: {
    marginBottom: 8,
    color: '#333',
    fontWeight: '700',
    fontSize: 16,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#d0dbe8',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#f8faff',
  },
  picker: {
    height: 52,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#d0dbe8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 15,
    backgroundColor: '#f8faff',
    color: '#222',
    shadowColor: '#0b7cff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  btn: {
    backgroundColor: '#0b7cff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#0b7cff',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    transform: [{ scale: 1 }],
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.3,
  },
  registerSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  registerLabel: {
    color: '#555',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  registerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  regBtn: {
    backgroundColor: '#eef6ff',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    margin: 6,
    shadowColor: '#0b7cff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  regText: {
    color: '#0b7cff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
