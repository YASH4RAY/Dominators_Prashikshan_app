// src/screens/Faculty/FacultyCertificates.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function FacultyCertificates() {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    const fetchCerts = async () => {
      const q = query(collection(db, "certificates"), where("status", "==", "pending"));
      const snap = await getDocs(q);
      setCerts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchCerts();
  }, []);

  const handleUpdate = async (id, status) => {
    await updateDoc(doc(db, "certificates", id), { status });
    alert(`Certificate ${status}`);
    setCerts(certs.filter((c) => c.id !== id));
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Pending Certificates</Text>
      <FlatList
        data={certs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 8 }}>
            <Text>Student: {item.studentId}</Text>
            <Text>Certificate URL: {item.fileUrl}</Text>
            <Button title="Approve" onPress={() => handleUpdate(item.id, "approved")} />
            <Button title="Reject" onPress={() => handleUpdate(item.id, "rejected")} />
          </View>
        )}
      />
    </View>
  );
}
