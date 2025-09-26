// src/screens/Faculty/Planning.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { db } from '../../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { AuthContext } from '../../context/AuthContext';

export default function Planning() {
  const { user } = useContext(AuthContext);
  const [studentId, setStudentId] = useState("");
  const [plan, setPlan] = useState("");

  const handleSave = async () => {
    await addDoc(collection(db, "plans"), {
      studentId,
      facultyId: user.uid,
      plan,
      createdAt: new Date(),
    });
    setStudentId(""); setPlan("");
    alert("Plan saved!");
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Academic & Internship Planning</Text>
      <TextInput placeholder="Student ID" value={studentId} onChangeText={setStudentId} style={{ borderWidth: 1, marginVertical: 8, padding: 6 }} />
      <TextInput placeholder="Plan Details" value={plan} onChangeText={setPlan} style={{ borderWidth: 1, marginVertical: 8, padding: 6 }} />
      <Button title="Save Plan" onPress={handleSave} />
    </View>
  );
}
