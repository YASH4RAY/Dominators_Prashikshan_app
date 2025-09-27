import React, { useState, useContext, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { db } from "../../config/firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";

export default function Logbooks() {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [entry, setEntry] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    const q = query(collection(db, "logbooks"), where("studentId", "==", user.uid));
    const snap = await getDocs(q);
    // Sort by createdAt descending
    const sorted = snap.docs
      .map((d) => d.data())
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setLogs(sorted);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleAddLog = async () => {
    if (!entry.trim()) return;
    setAdding(true);
    await addDoc(collection(db, "logbooks"), {
      studentId: user.uid,
      content: entry,
      createdAt: serverTimestamp(),
      facultyId: "assigned-faculty-id" // store from user profile for routing
    });
    setEntry("");
    setAdding(false);
    fetchLogs();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📔 Internship Logbook</Text>
      <TextInput
        value={entry}
        onChangeText={setEntry}
        placeholder="Write today's progress..."
        style={styles.input}
        multiline
      />
      <Button title={adding ? "Adding..." : "Add Log ✍️"} onPress={handleAddLog} disabled={adding || !entry.trim()} />
      {loading ? (
        <View style={styles.center}><ActivityIndicator /><Text>Loading logs...</Text></View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }) => (
            <View style={styles.logCard}>
              <Text style={styles.logContent}>📝 {item.content}</Text>
              <Text style={styles.logDate}>
                {item.createdAt?.seconds
                  ? new Date(item.createdAt.seconds * 1000).toLocaleString()
                  : ""}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.noLogs}>No log entries yet. Start journaling your journey! 🚀</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f8ff" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 12, color: "#0b7cff" },
  input: {
    borderWidth: 1,
    borderColor: "#e3e8f0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 15,
    minHeight: 48,
  },
  logCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#e3e8f0",
    shadowColor: "#0b7cff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  logContent: { fontSize: 15, color: "#222", marginBottom: 4 },
  logDate: { fontSize: 12, color: "#888" },
  noLogs: { color: "#888", fontStyle: "italic", marginTop: 24, textAlign: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
