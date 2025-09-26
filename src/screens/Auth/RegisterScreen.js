// src/screens/Auth/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export default function RegisterScreen({ navigation, route }) {
  const roleFromParam = route.params?.role || 'student';
  const [role] = useState(roleFromParam);
  const [loading, setLoading] = useState(false);

  // common
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // student-specific
  const [collegeName, setCollegeName] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [skills, setSkills] = useState(''); // comma-separated
  const [domains, setDomains] = useState('');

  // college/company/faculty specifics (we'll use minimal)
  const [orgName, setOrgName] = useState('');

  const onRegister = async () => {
    if (!email || !password || !name) {
      return Alert.alert('Missing fields', 'Please fill name, email and password');
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = cred.user.uid;

      // build profile doc
      const base = {
        uid,
        name,
        email: email.trim(),
        role,
        createdAt: serverTimestamp()
      };

      let profile = base;

      if (role === 'student') {
        profile = {
          ...base,
          collegeName,
          branch,
          year,
          skills: skills ? skills.split(',').map(s => s.trim()) : [],
          domainsOfInterest: domains ? domains.split(',').map(s => s.trim()) : []
        };
      } else if (role === 'college') {
        profile = { ...base, collegeName: orgName };
      } else if (role === 'company') {
        profile = { ...base, companyName: orgName };
      } else if (role === 'faculty') {
        profile = { ...base, collegeName: orgName, department: branch || '' };
      }

      // IMPORTANT: write the user doc before changing auth flows.
      await setDoc(doc(db, 'users', uid), profile);

      // Sign the user out so UI flow is predictable for the MVP.
      await signOut(auth);

      Alert.alert('Registered', 'Account created. Please login on the Login screen.');
      // NOTE: do NOT call navigation.navigate here — auth listener will show the Login screen.
    } catch (err) {
      Alert.alert('Registration error', err.message);
      console.warn('Register error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.head}>Register as {role.toUpperCase()}</Text>

      <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

      {role === 'student' && (
        <>
          <TextInput style={styles.input} placeholder="College name" value={collegeName} onChangeText={setCollegeName} />
          <TextInput style={styles.input} placeholder="Branch" value={branch} onChangeText={setBranch} />
          <TextInput style={styles.input} placeholder="Year / Semester" value={year} onChangeText={setYear} />
          <TextInput style={styles.input} placeholder="Skills (comma-separated)" value={skills} onChangeText={setSkills} />
          <TextInput style={styles.input} placeholder="Domains of interest (comma-separated)" value={domains} onChangeText={setDomains} />
        </>
      )}

      { (role === 'college' || role === 'company' || role === 'faculty') && (
        <>
          <TextInput style={styles.input} placeholder={role === 'company' ? 'Company name' : 'College name'} value={orgName} onChangeText={setOrgName} />
          { role === 'faculty' && <TextInput style={styles.input} placeholder="Department (optional)" value={branch} onChangeText={setBranch} /> }
        </>
      )}

      <TouchableOpacity style={styles.btn} onPress={onRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Register</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={{marginTop:16}} onPress={() => navigation.navigate('Login')}>
        <Text>Already registered? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{padding:20,flexGrow:1,justifyContent:'center'},
  head:{fontSize:22,fontWeight:'700',marginBottom:20,textAlign:'center'},
  input:{borderWidth:1,borderColor:'#ddd',padding:12,borderRadius:8,marginBottom:12},
  btn:{backgroundColor:'#0b7cff',padding:14,borderRadius:8,alignItems:'center'},
  btnText:{color:'#fff',fontWeight:'700'}
});
