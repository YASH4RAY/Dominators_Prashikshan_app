// src/screens/Faculty/StudentLogs.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Button,
  Alert,
} from "react-native";
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

export default function StudentLogs({ route }) {
  const { studentId } = route.params || {}; // ✅ safe check
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState({}); // local state for editing feedbacks

  useEffect(() => {
    if (!studentId) {
      setLoading(false); // nothing to fetch
      return;
    }

    const fetchLogs = async () => {
      try {
        const q = query(
          collection(db, "logbooks"),
          where("studentId", "==", studentId),
          orderBy("date", "desc")
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setLogs(data);

        // preload existing feedback into local state
        const feedbackMap = {};
        data.forEach((log) => {
          feedbackMap[log.id] = log.facultyFeedback || "";
        });
        setFeedbacks(feedbackMap);
      } catch (err) {
        console.warn("logs fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [studentId]);

  const saveFeedback = async (logId) => {
    try {
      const feedback = feedbacks[logId];
      await updateDoc(doc(db, "logbooks", logId), { facultyFeedback: feedback });
      Alert.alert("Success", "Feedback saved!");
    } catch (err) {
      console.warn("feedback save error", err);
      Alert.alert("Error", "Failed to save feedback");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading student logs...</Text>
      </View>
    );
  }

  if (!studentId) {
    return (
      <View style={styles.center}>
        <Text>No student selected. Please open logs via Assigned Students.</Text>
      </View>
    );
  }

  if (logs.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No logs found for this student yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logs</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>{item.date}</Text>
            <Text>Login: {item.loginTime}</Text>
            <Text>Logout: {item.logoutTime}</Text>
            <Text>Work: {item.workDone}</Text>

            {/* ✅ Faculty Feedback */}
            <Text style={styles.feedbackLabel}>Feedback:</Text>
            <TextInput
              style={styles.input}
              placeholder="Write feedback..."
              value={feedbacks[item.id]}
              onChangeText={(text) =>
                setFeedbacks((prev) => ({ ...prev, [item.id]: text }))
              }
            />
            <Button title="Save Feedback" onPress={() => saveFeedback(item.id)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
  },
  date: { fontWeight: "bold", marginBottom: 4 },
  feedbackLabel: { marginTop: 10, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
