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
        // No profile doc — sign out and ask user to register
        Alert.alert('Account incomplete', 'No profile found. Please register.');
        await auth.signOut();
        setLoading(false);
        return;
      }

      const actualRole = snap.data().role;

      if (selectedRole && selectedRole !== actualRole) {
        // Warn user but allow login; routing will be based on actual role from AuthContext/RootNavigator
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
      <Text style={styles.head}>Login</Text>

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

      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.btn} onPress={onLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
      </TouchableOpacity>

      {/* QUICK REGISTER LINKS */}
      <View style={{marginTop:18, alignItems:'center'}}>
        <Text style={{color:'#666'}}>New user? Register as:</Text>
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
  container:{flex:1,justifyContent:'center',padding:20},
  head:{fontSize:22,fontWeight:'700',marginBottom:12},
  label:{marginBottom:6, color:'#444'},
  pickerWrap:{borderWidth:1,borderColor:'#ddd',borderRadius:8,marginBottom:12,overflow:'hidden'},
  picker:{height:48},
  input:{borderWidth:1,borderColor:'#ddd',padding:12,borderRadius:8,marginBottom:12},
  btn:{backgroundColor:'#0b7cff',padding:14,borderRadius:8,alignItems:'center'},
  btnText:{color:'#fff',fontWeight:'700'},
  registerRow:{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',marginTop:8},
  regBtn:{backgroundColor:'#eef6ff',paddingVertical:8,paddingHorizontal:12,borderRadius:8,margin:6},
  regText:{color:'#0b7cff',fontWeight:'600'}
});
