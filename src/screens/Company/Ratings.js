// src/screens/Company/Ratings.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { db } from '../../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function Ratings() {
  const [studentId, setStudentId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState("");

  const handleSubmit = async () => {
    await addDoc(collection(db, "ratings"), {
      studentId,
      feedback,
      rating,
      createdAt: new Date(),
    });
    setStudentId(""); setFeedback(""); setRating("");
    alert("Feedback submitted!");
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Rate Interns</Text>
      <TextInput placeholder="Student ID" value={studentId} onChangeText={setStudentId} style={{ borderWidth: 1, padding: 6, marginVertical: 8 }} />
      <TextInput placeholder="Feedback" value={feedback} onChangeText={setFeedback} style={{ borderWidth: 1, padding: 6, marginVertical: 8 }} />
      <TextInput placeholder="Rating (1-5)" value={rating} onChangeText={setRating} style={{ borderWidth: 1, padding: 6, marginVertical: 8 }} />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}
