// src/screens/Faculty/Planning.js
import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";

export default function Planning() {
  const { user } = useContext(AuthContext);
  const [studentId, setStudentId] = useState(""); // enter or select student
  const [planText, setPlanText] = useState("");
  const [fileUri, setFileUri] = useState(null);

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    });
    if (!res.canceled) {
      setFileUri(res.assets[0].uri);
    }
  };

  const submitPlan = async () => {
    if (!studentId || !planText) return Alert.alert("Error", "Enter student ID and plan text");
    try {
      let fileUrl = null;
      if (fileUri) {
        const storage = getStorage();
        const fileRef = ref(storage, `planning/${user.uid}_${Date.now()}.pdf`);
        const response = await fetch(fileUri);
        const blob = await response.blob();
        await uploadBytes(fileRef, blob);
        fileUrl = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, "planning"), {
        facultyId: user.uid,
        studentId,
        planText,
        fileUrl,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Plan submitted successfully!");
      setStudentId("");
      setPlanText("");
      setFileUri(null);
    } catch (err) {
      console.warn("plan submit error", err);
      Alert.alert("Error", "Failed to submit plan");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send Planning</Text>
      <TextInput
        style={styles.input}
        placeholder="Student ID"
        value={studentId}
        onChangeText={setStudentId}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Type planning here..."
        value={planText}
        onChangeText={setPlanText}
        multiline
      />
      <Button title="Attach File" onPress={pickFile} />
      <View style={{ marginTop: 12 }}>
        <Button title="Submit Plan" onPress={submitPlan} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
});
