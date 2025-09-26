// src/screens/College/CollegeCourses.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { db } from '../../config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default function CollegeCourses() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      const snap = await getDocs(collection(db, "courses"));
      setCourses(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchCourses();
  }, []);

  const handleAdd = async () => {
    await addDoc(collection(db, "courses"), { title });
    setTitle("");
    alert("Course added!");
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Manage Courses</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Course title"
        style={{ borderWidth: 1, marginVertical: 10, padding: 6 }}
      />
      <Button title="Add Course" onPress={handleAdd} />
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={{ marginVertical: 6 }}>• {item.title}</Text>
        )}
      />
    </View>
  );
}
