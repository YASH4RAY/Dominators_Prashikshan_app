// src/screens/Company/Applications.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { db } from '../../config/firebase';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { AuthContext } from '../../context/AuthContext';

export default function Applications() {
  const { user } = useContext(AuthContext);
  const [apps, setApps] = useState([]);

  useEffect(() => {
    const fetchApps = async () => {
      const internshipsSnap = await getDocs(
        query(collection(db, "internships"), where("companyId", "==", user.uid))
      );

      let allApps = [];
      for (let intern of internshipsSnap.docs) {
        const appsSnap = await getDocs(
          query(collection(db, "applications"), where("internshipId", "==", intern.id))
        );
        allApps.push(...appsSnap.docs.map((d) => ({ id: d.id, ...d.data(), internshipTitle: intern.data().title })));
      }
      setApps(allApps);
    };
    fetchApps();
  }, []);

  const handleUpdate = async (id, status) => {
    await updateDoc(doc(db, "applications", id), { status });
    alert(`Application ${status}`);
    setApps(apps.filter((a) => a.id !== id));
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Applications</Text>
      <FlatList
        data={apps}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 8 }}>
            <Text>Internship: {item.internshipTitle}</Text>
            <Text>Student: {item.studentId}</Text>
            <Button title="Accept" onPress={() => handleUpdate(item.id, "accepted")} />
            <Button title="Reject" onPress={() => handleUpdate(item.id, "rejected")} />
          </View>
        )}
      />
    </View>
  );
}
