// src/screens/Faculty/StudentLogs.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TextInput, Button } from 'react-native';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { AuthContext } from '../../context/AuthContext';

export default function StudentLogs() {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});

  useEffect(() => {
    const fetchLogs = async () => {
      const q = query(collection(db, "logbooks"), where("facultyId", "==", user.uid));
      const snap = await getDocs(q);
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchLogs();
  }, []);

  const handleFeedback = async (id) => {
    const ref = doc(db, "logbooks", id);
    await updateDoc(ref, { feedback: feedbacks[id] || "" });
    alert("Feedback saved!");
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Student Logs</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 8 }}>
            <Text>{item.studentId}: {item.content}</Text>
            <TextInput
              placeholder="Write feedback"
              value={feedbacks[item.id] || ""}
              onChangeText={(val) => setFeedbacks({ ...feedbacks, [item.id]: val })}
              style={{ borderWidth: 1, marginVertical: 6, padding: 6 }}
            />
            <Button title="Save Feedback" onPress={() => handleFeedback(item.id)} />
          </View>
        )}
      />
    </View>
  );
}
