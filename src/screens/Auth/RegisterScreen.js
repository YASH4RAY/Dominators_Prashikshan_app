// src/screens/Auth/RegisterScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, query, collection, where, getDocs } from 'firebase/firestore';
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
  const [skills, setSkills] = useState('');
  const [domains, setDomains] = useState('');
  const [enteredCollegeId, setEnteredCollegeId] = useState('');

  // college/company-specific
  const [orgName, setOrgName] = useState('');
  const [collegeIdInput, setCollegeIdInput] = useState('');

  // faculty-specific
  const [facultyId, setFacultyId] = useState('');
  const [profession, setProfession] = useState('');
  const [department, setDepartment] = useState('');
  const [facultyBranch, setFacultyBranch] = useState('');
  const [facultyCollege, setFacultyCollege] = useState('');

  const onRegister = async () => {
    if (!email || !password || !name) {
      return Alert.alert('Missing fields', 'Please fill name, email and password');
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = cred.user.uid;

      const base = {
        uid,
        name,
        email: email.trim(),
        role,
        createdAt: serverTimestamp(),
      };

      let profile = base;

      if (role === 'student') {
        // check collegeId
        const q = query(
          collection(db, 'users'),
          where('role', '==', 'college'),
          where('collegeId', '==', enteredCollegeId)
        );
        const snap = await getDocs(q);
        if (snap.empty) {
          throw new Error('Invalid College ID. Please ask your college for the correct ID.');
        }

        // generate Student ID
        const studentId = `${enteredCollegeId}-${Math.floor(1000 + Math.random() * 9000)}`;

        profile = {
          ...base,
          studentId,
          collegeId: enteredCollegeId,
          collegeName,
          branch,
          year,
          skills: skills ? skills.split(',').map((s) => s.trim()) : [],
          domainsOfInterest: domains ? domains.split(',').map((s) => s.trim()) : [],
        };
      } else if (role === 'college') {
        if (!collegeIdInput) {
          throw new Error('Please provide a College ID for your institution.');
        }
        profile = { ...base, collegeName: orgName, collegeId: collegeIdInput };
      } else if (role === 'company') {
        profile = { ...base, companyName: orgName };
      } else if (role === 'faculty') {
        profile = {
          ...base,
          facultyId,
          profession,
          department,
          branch: facultyBranch,
          collegeName: facultyCollege,
        };
      }

      await setDoc(doc(db, 'users', uid), profile);

      await signOut(auth);

      Alert.alert('Registered', 'Account created. Please login on the Login screen.');
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

      <TextInput
        style={styles.input}
        placeholder="Full name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {role === 'student' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="College ID"
            value={enteredCollegeId}
            onChangeText={setEnteredCollegeId}
          />
          <TextInput
            style={styles.input}
            placeholder="College name"
            value={collegeName}
            onChangeText={setCollegeName}
          />
          <TextInput
            style={styles.input}
            placeholder="Branch"
            value={branch}
            onChangeText={setBranch}
          />
          <TextInput
            style={styles.input}
            placeholder="Year / Semester"
            value={year}
            onChangeText={setYear}
          />
          <TextInput
            style={styles.input}
            placeholder="Skills (comma-separated)"
            value={skills}
            onChangeText={setSkills}
          />
          <TextInput
            style={styles.input}
            placeholder="Domains of interest (comma-separated)"
            value={domains}
            onChangeText={setDomains}
          />
        </>
      )}

      {role === 'college' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="College name"
            value={orgName}
            onChangeText={setOrgName}
          />
          <TextInput
            style={styles.input}
            placeholder="College ID"
            value={collegeIdInput}
            onChangeText={setCollegeIdInput}
          />
        </>
      )}

      {role === 'company' && (
        <TextInput
          style={styles.input}
          placeholder="Company name"
          value={orgName}
          onChangeText={setOrgName}
        />
      )}

      {role === 'faculty' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Faculty ID"
            value={facultyId}
            onChangeText={setFacultyId}
          />
          <TextInput
            style={styles.input}
            placeholder="Profession"
            value={profession}
            onChangeText={setProfession}
          />
          <TextInput
            style={styles.input}
            placeholder="Department"
            value={department}
            onChangeText={setDepartment}
          />
          <TextInput
            style={styles.input}
            placeholder="Branch"
            value={facultyBranch}
            onChangeText={setFacultyBranch}
          />
          <TextInput
            style={styles.input}
            placeholder="College Name"
            value={facultyCollege}
            onChangeText={setFacultyCollege}
          />
        </>
      )}

      <TouchableOpacity style={styles.btn} onPress={onRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Register</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 16 }} onPress={() => navigation.navigate('Login')}>
        <Text>Already registered? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  head: { fontSize: 22, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: '#0b7cff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
