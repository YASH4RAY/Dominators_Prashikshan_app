// src/screens/Student/ProfileScreen.js
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
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
        <ActivityIndicator size="large" color="#0b7cff" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0b7cff" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <Text style={styles.head}>👤 My Profile</Text>
            <Text style={styles.subtitle}>Manage your information</Text>
          </View>
          <View style={styles.headerWave} />
        </View>

        {/* Profile Card */}
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
          <Text style={styles.hint}>📷 Tap picture to upload/change</Text>

          {/* Profile Info */}
          <Text style={styles.name}>🎓 {profile.name}</Text>
          <Text style={styles.email}>✉️ {profile.email}</Text>
          <Text style={styles.info}>
            🆔 Student ID:{" "}
            <Text style={styles.infoValue}>
              {profile.studentId || "Not assigned"}
            </Text>
          </Text>
          <Text style={styles.info}>
            🏫 College ID:{" "}
            <Text style={styles.infoValue}>{profile.collegeId || "N/A"}</Text>
          </Text>
          <Text style={styles.info}>🏢 {profile.collegeName}</Text>
          <Text style={styles.info}>
            📚 {profile.branch} - Year {profile.year}
          </Text>
          <Text style={styles.skillLabel}>💡 Skills:</Text>
          {profile.skills?.length ? (
            <View style={styles.skillWrap}>
              {profile.skills.map((s, idx) => (
                <View key={idx} style={styles.skillChip}>
                  <Text style={styles.skillText}>✨ {s}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noSkills}>No skills added yet. 🚀</Text>
          )}

          {/* Add skill input */}
          <View style={styles.skillRow}>
            <TextInput
              style={styles.input}
              placeholder="Add a new skill"
              value={newSkill}
              onChangeText={setNewSkill}
              placeholderTextColor="#a0a0a0"
            />
            <TouchableOpacity
              style={[styles.btn, savingSkill && styles.btnDisabled]}
              onPress={addSkill}
              disabled={savingSkill}
              activeOpacity={0.8}
            >
              {savingSkill ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>Add</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={logout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  // Header
  headerGradient: {
    position: "relative",
    width: "100%",
    height: 160,
    backgroundColor: "#0b7cff",
    paddingTop: 20,
    overflow: "hidden",
  },
  headerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 2,
  },
  head: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  headerWave: {
    position: "absolute",
    bottom: -2,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  // Card
  card: {
    marginTop: -20,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#0b7cff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(11, 124, 255, 0.08)",
    alignItems: "center",
  },
  avatar: { width: 110, height: 110, borderRadius: 55, marginBottom: 6 },
  placeholderAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  placeholderText: { fontSize: 40, color: "#fff", fontWeight: "bold" },
  hint: { fontSize: 12, color: "#555", marginBottom: 12 },
  name: { fontSize: 20, fontWeight: "bold", marginTop: 6, color: "#0b7cff" },
  email: { fontSize: 15, color: "#374151", marginBottom: 4 },
  info: { fontSize: 15, color: "#374151", marginBottom: 2 },
  infoValue: { fontWeight: "700", color: "#0b7cff" },
  skillLabel: {
    marginTop: 10,
    fontWeight: "600",
    color: "#222",
    fontSize: 15,
  },
  skillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    gap: 8,
  },
  skillChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#e8f5e9",
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: { fontSize: 13, fontWeight: "600", color: "#388e3c" },
  noSkills: { color: "#888", fontStyle: "italic", marginTop: 4 },
  skillRow: {
    flexDirection: "row",
    marginTop: 16,
    width: "100%",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    marginRight: 8,
  },
  btn: {
    backgroundColor: "#0b7cff",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#0b7cff",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  logoutContainer: { marginTop: 30, alignItems: "center" },
  logoutBtn: {
    backgroundColor: "#fff",
    borderColor: "#dc2626",
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: "center",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    color: "#dc2626",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
