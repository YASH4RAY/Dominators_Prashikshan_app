// src/screens/Faculty/AssignedStudents.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList } from 'react-native';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { AuthContext } from '../../context/AuthContext';

export default function AssignedStudents() {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const q = query(collection(db, "users"), where("role", "==", "student"), where("facultyId", "==", user.uid));
      const snap = await getDocs(q);
      setStudents(snap.docs.map((doc) => doc.data()));
    };
    fetchStudents();
  }, []);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Assigned Students</Text>
      <FlatList
        data={students}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 8 }}>
            <Text>{item.name} - {item.branch} Sem {item.semester}</Text>
          </View>
        )}
      />
    </View>
  );
}
