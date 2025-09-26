// src/screens/College/InternshipApprovals.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { db } from '../../config/firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

export default function InternshipApprovals() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApps = async () => {
      const q = query(collection(db, "applications"), where("status", "==", "pending"));
      const snap = await getDocs(q);
      setApplications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchApps();
  }, []);

  const handleUpdate = async (id, status) => {
    const ref = doc(db, "applications", id);
    await updateDoc(ref, { status });
    alert(`Application ${status}`);
    setApplications(applications.filter((a) => a.id !== id));
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Pending Applications</Text>
      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 8 }}>
            <Text>Student: {item.studentId}</Text>
            <Text>Internship: {item.internshipId}</Text>
            <Button title="Approve" onPress={() => handleUpdate(item.id, "approved")} />
            <Button title="Reject" onPress={() => handleUpdate(item.id, "rejected")} />
          </View>
        )}
      />
    </View>
  );
}
