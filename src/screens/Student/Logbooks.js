// src/screens/Student/Logbooks.js
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { db } from '../../config/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { AuthContext } from '../../context/AuthContext';

export default function Logbooks() {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [entry, setEntry] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      const q = query(collection(db, "logbooks"), where("studentId", "==", user.uid));
      const snap = await getDocs(q);
      setLogs(snap.docs.map((doc) => doc.data()));
    };
    fetchLogs();
  }, []);

  const handleAddLog = async () => {
    await addDoc(collection(db, "logbooks"), {
      studentId: user.uid,
      content: entry,
      createdAt: new Date(),
    });
    setEntry("");
    alert("Log added!");
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontWeight: "bold", fontSize: 20 }}>My Logbook</Text>
      <TextInput
        value={entry}
        onChangeText={setEntry}
        placeholder="Write weekly progress..."
        style={{ borderWidth: 1, padding: 8, marginVertical: 12 }}
      />
      <Button title="Add Entry" onPress={handleAddLog} />
      <FlatList
        data={logs}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={{ marginTop: 10 }}>
            <Text>{item.content}</Text>
            <Text style={{ fontSize: 12, color: "gray" }}>{String(item.createdAt)}</Text>
          </View>
        )}
      />
    </View>
  );
}
