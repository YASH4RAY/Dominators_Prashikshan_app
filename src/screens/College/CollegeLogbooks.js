// src/screens/College/CollegeLogbooks.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { db } from '../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function CollegeLogbooks() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const snap = await getDocs(collection(db, "logbooks"));
      setLogs(snap.docs.map((doc) => doc.data()));
    };
    fetchLogs();
  }, []);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Student Logbooks</Text>
      <FlatList
        data={logs}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 8 }}>
            <Text>Student: {item.studentId}</Text>
            <Text>Log: {item.content}</Text>
          </View>
        )}
      />
    </View>
  );
}
