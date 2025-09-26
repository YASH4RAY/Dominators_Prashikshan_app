import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';

export default function InternshipList() {
  const { user } = useContext(AuthContext);
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    const fetchInternships = async () => {
      const snap = await getDocs(collection(db, "internships"));
      setInternships(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchInternships();
  }, []);

  const handleApply = async (internshipId) => {
    await addDoc(collection(db, "applications"), {
      studentId: user.uid,
      internshipId,
      status: "pending",
      appliedAt: new Date(),
    });
    alert("Applied successfully!");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={internships}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.companyName}</Text>
            <Text>Mode: {item.mode}</Text>
            <Text>Location: {item.location}</Text>
            <Button title="Apply" onPress={() => handleApply(item.id)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  card: { padding: 12, marginBottom: 10, backgroundColor: "#f9f9f9", borderRadius: 8 },
  title: { fontWeight: "bold", fontSize: 16 },
});
