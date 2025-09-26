// src/screens/Student/Applications.js
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';

export default function Applications() {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      const q = query(collection(db, "applications"), where("studentId", "==", user.uid));
      const snap = await getDocs(q);
      setApplications(snap.docs.map((doc) => doc.data()));
    };
    fetchApplications();
  }, []);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>My Applications</Text>
      <FlatList
        data={applications}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10 }}>
            <Text>Internship ID: {item.internshipId}</Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}
