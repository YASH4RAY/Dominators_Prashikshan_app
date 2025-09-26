import React, { useState, useContext, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";
import { db } from "../../config/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";

export default function Logbooks() {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [entry, setEntry] = useState("");

  const fetchLogs = async () => {
    const q = query(collection(db, "logbooks"), where("studentId", "==", user.uid));
    const snap = await getDocs(q);
    setLogs(snap.docs.map((d) => d.data()));
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleAddLog = async () => {
    await addDoc(collection(db, "logbooks"), {
      studentId: user.uid,
      content: entry,
      createdAt: new Date(),
      facultyId: "assigned-faculty-id" // store from user profile for routing
    });
    setEntry("");
    fetchLogs();
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Internship Logbook</Text>
      <TextInput
        value={entry}
        onChangeText={setEntry}
        placeholder="Write today's progress..."
        style={{ borderWidth: 1, marginVertical: 8, padding: 8 }}
      />
      <Button title="Add Log" onPress={handleAddLog} />
      <FlatList
        data={logs}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 8 }}>
            <Text>{item.content}</Text>
            <Text style={{ fontSize: 12, color: "gray" }}>{String(item.createdAt)}</Text>
          </View>
        )}
      />
    </View>
  );
}
