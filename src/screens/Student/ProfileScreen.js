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
      <View style={styles.headerGradient}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <View style={styles.card}>
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

        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Student ID:</Text><Text style={styles.infoValue}>{profile.studentId || "Not assigned"}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>College ID:</Text><Text style={styles.infoValue}>{profile.collegeId || "N/A"}</Text></View>
        <Text style={styles.infoValue}>{profile.collegeName}</Text>
        <Text style={styles.infoValue}>{profile.branch} - Year {profile.year}</Text>

        <Text style={styles.skillTitle}>Skills</Text>
        {profile.skills?.length ? (
          <View style={styles.skillWrap}>
            {profile.skills.map((s, idx) => (
              <View key={idx} style={styles.skillChip}>
                <Text style={styles.skillText}>{s}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noSkillText}>No skills added yet</Text>
        )}

        <View style={styles.skillRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a new skill"
            value={newSkill}
            onChangeText={setNewSkill}
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity style={styles.addBtn} onPress={addSkill} disabled={savingSkill}>
            <Text style={styles.addBtnText}>{savingSkill ? "Adding..." : "Add"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
    padding: 0,
    justifyContent: 'flex-start',
  },
  headerGradient: {
    width: '100%',
    height: 120,
    backgroundColor: 'linear-gradient(90deg, #0b7cff 0%, #00c6fb 100%)',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 18,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: -30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  card: {
    marginTop: -30,
    marginHorizontal: 18,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e3eaf2',
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 8,
    borderWidth: 4,
    borderColor: '#0b7cff',
    backgroundColor: '#eaf4ff',
    shadowColor: '#0b7cff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  placeholderAvatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 4,
    borderColor: '#0b7cff',
  },
  placeholderText: {
    fontSize: 44,
    color: '#fff',
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 13,
    color: '#0b7cff',
    marginBottom: 14,
    fontWeight: '600',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 6,
    color: '#0b7cff',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  email: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  infoLabel: {
    fontWeight: '600',
    color: '#555',
    fontSize: 15,
    marginRight: 4,
  },
  infoValue: {
    fontWeight: '700',
    color: '#0b7cff',
    fontSize: 15,
  },
  skillTitle: {
    marginTop: 18,
    fontWeight: '700',
    fontSize: 17,
    color: '#222',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  skillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
    gap: 10,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  skillChip: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#eaf4ff',
    marginBottom: 6,
    shadowColor: '#0b7cff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 1,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0b7cff',
    letterSpacing: 0.2,
  },
  noSkillText: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  skillRow: {
    flexDirection: 'row',
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#0b7cff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 15,
    backgroundColor: '#f4f7fb',
    color: '#222',
  },
  addBtn: {
    backgroundColor: '#0b7cff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#0b7cff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  logoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 18,
    marginTop: 30,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e3eaf2',
  },
  logoutBtnText: {
    color: '#0b7cff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
