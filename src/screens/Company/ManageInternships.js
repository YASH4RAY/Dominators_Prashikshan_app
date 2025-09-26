// src/screens/Company/ManageInternships.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { AuthContext } from '../../context/AuthContext';

export default function ManageInternships() {
  const { user } = useContext(AuthContext);
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    const fetchInternships = async () => {
      const q = query(collection(db, "internships"), where("companyId", "==", user.uid));
      const snap = await getDocs(q);
      setInternships(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchInternships();
  }, []);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "internships", id));
    setInternships(internships.filter((i) => i.id !== id));
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>My Internships</Text>
      <FlatList
        data={internships}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 8 }}>
            <Text>{item.title} ({item.location})</Text>
            <Button title="Delete" onPress={() => handleDelete(item.id)} />
          </View>
        )}
      />
    </View>
  );
}
