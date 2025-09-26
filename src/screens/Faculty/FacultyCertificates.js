// src/screens/Faculty/Certificates.js
import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { AuthContext } from "../../context/AuthContext";

export default function Certificates() {
  const { user } = useContext(AuthContext);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const q = query(collection(db, "certificates"));
        const snap = await getDocs(q);
        setCerts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.warn("certs fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "certificates", id), { facultyApproval: status });
      Alert.alert("Updated", `Certificate ${status}`);
    } catch (err) {
      console.warn("cert update error", err);
      Alert.alert("Error", "Failed to update certificate");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading certificates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Certificates</Text>
      <FlatList
        data={certs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Student: {item.studentId}</Text>
            <Text>File: {item.fileUrl}</Text>
            <Text>Status: {item.facultyApproval || "Pending"}</Text>
            <View style={styles.row}>
              <Button title="Approve" onPress={() => updateStatus(item.id, "Approved")} />
              <Button title="Reject" color="red" onPress={() => updateStatus(item.id, "Rejected")} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: { padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
