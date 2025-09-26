// src/screens/Company/PostInternship.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { AuthContext } from '../../context/AuthContext';

export default function PostInternship() {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState("remote");

  const handlePost = async () => {
    await addDoc(collection(db, "internships"), {
      title,
      description,
      location,
      mode,
      companyId: user.uid,
      companyName: user.name || "Company Admin",
      postedAt: serverTimestamp(),
      verified: true,
    });
    alert("Internship posted!");
    setTitle(""); setDescription(""); setLocation("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Post Internship</Text>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
      <TextInput placeholder="Location" value={location} onChangeText={setLocation} style={styles.input} />
      <TextInput placeholder="Mode (remote/hybrid/onsite)" value={mode} onChangeText={setMode} style={styles.input} />
      <Button title="Post" onPress={handlePost} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 12, borderRadius: 6 },
});
