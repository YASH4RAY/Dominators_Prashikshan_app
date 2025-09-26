import React, { useState, useContext } from "react";
import { View, Text, Button, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";

export default function Certificates() {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState(null);

  const handlePick = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (res.type === "success") {
        setFile(res);
      }
    } catch (err) {
      console.warn("pick error", err);
      Alert.alert("Error", "Could not pick file");
    }
  };

  const handleUpload = async () => {
    if (!file) return Alert.alert("No file", "Please select a file first");

    try {
      // Read as base64
      const base64Data = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert to Uint8Array
      const buffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

      // Upload
      const storage = getStorage();
      const storageRef = ref(storage, `certificates/${user.uid}_${file.name}`);
      await uploadBytes(storageRef, buffer);

      // Get URL
      const url = await getDownloadURL(storageRef);

      // Save record in Firestore
      await addDoc(collection(db, "certificates"), {
        studentId: user.uid,
        fileUrl: url,
        status: "pending",
        uploadedAt: serverTimestamp(),
      });

      Alert.alert("Success", "Certificate uploaded for verification!");
      setFile(null);
    } catch (err) {
      console.warn("upload err", err);
      Alert.alert("Upload failed", err.message || String(err));
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Certificates</Text>
      <Button title="Select Certificate" onPress={handlePick} />
      {file && <Text style={{ marginVertical: 8 }}>Selected: {file.name}</Text>}
      <Button title="Upload" onPress={handleUpload} disabled={!file} />
    </View>
  );
}
