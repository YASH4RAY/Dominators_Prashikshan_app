// src/screens/Student/ProfileScreen.js
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../config/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [savingSkill, setSavingSkill] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) setProfile(snap.data());
    });
    return () => unsub();
  }, [user.uid]);

  // 📸 Pick image
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need gallery access.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Images],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!res.canceled) {
      uploadImage(res.assets[0].uri);
    }
  };

  // 📤 Upload image to Firebase Storage
  const uploadImage = async (uri) => {
    try {
      setUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();

      const storage = getStorage();
      const storageRef = ref(storage, `profilePics/${user.uid}.jpg`);

      await uploadBytes(storageRef, blob, { contentType: "image/jpeg" });
      const url = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "users", user.uid), { photoUrl: url });
      Alert.alert("Success", "Profile picture updated!");
    } catch (err) {
      console.warn("upload err", err);
      Alert.alert("Error", err.message || "Failed to upload");
    } finally {
      setUploading(false);
    }
  };

  // ➕ Add skill
  const addSkill = async () => {
    if (!newSkill.trim()) return;
    if (!profile) return;

    const cleanSkill = newSkill.trim();
    if (profile.skills?.includes(cleanSkill)) {
      Alert.alert("Duplicate Skill", "This skill is already added.");
      return;
    }

    try {
      setSavingSkill(true);
      const updatedSkills = [...(profile.skills || []), cleanSkill];
      await updateDoc(doc(db, "users", user.uid), { skills: updatedSkills });
      setNewSkill("");
    } catch (err) {
      console.warn("add skill error", err);
      Alert.alert("Error", "Failed to add skill");
    } finally {
      setSavingSkill(false);
    }
  };

  if (!profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Profile Pic */}
        <TouchableOpacity onPress={pickImage} disabled={uploading}>
          {profile.photoUrl ? (
            <Image source={{ uri: profile.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Text style={styles.placeholderText}>
                {profile.name ? profile.name[0].toUpperCase() : "?"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {uploading && <ActivityIndicator style={{ marginVertical: 10 }} />}
        <Text style={styles.hint}>Tap picture to upload/change</Text>

        {/* Profile Info */}
        <Text style={styles.name}>{profile.name}</Text>
        <Text>{profile.email}</Text>
        <Text>Student ID: {profile.studentId || "Not assigned"}</Text>
        <Text>College ID: {profile.collegeId || "N/A"}</Text>
        <Text>{profile.collegeName}</Text>
        <Text>
          {profile.branch} - Year {profile.year}
        </Text>
        <Text>Skills: {profile.skills?.join(", ") || "N/A"}</Text>

        {/* Add skill input */}
        <View style={styles.skillRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a new skill"
            value={newSkill}
            onChangeText={setNewSkill}
          />
          <Button
            title={savingSkill ? "Adding..." : "Add"}
            onPress={addSkill}
            disabled={savingSkill}
          />
        </View>
      </View>

      {/* Logout */}
      <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={logout} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "space-between" },
  card: { alignItems: "center" },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 6 },
  placeholderAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  placeholderText: { fontSize: 40, color: "#fff", fontWeight: "bold" },
  hint: { fontSize: 12, color: "#555", marginBottom: 12 },
  name: { fontSize: 18, fontWeight: "bold", marginTop: 6 },
  skillRow: {
    flexDirection: "row",
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
  },
  logoutContainer: { marginTop: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
