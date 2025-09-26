// src/screens/Student/StudentHome.js
import React, { useEffect, useState, useContext } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import { db } from "../../config/firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";

export default function StudentHome() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [facultyName, setFacultyName] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live profile listener
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "users", user.uid), async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);

        // fetch faculty name if assigned
        if (data.facultyId) {
          try {
            const facSnap = await getDoc(doc(db, "users", data.facultyId));
            if (facSnap.exists()) setFacultyName(facSnap.data().name);
          } catch (err) {
            console.warn("faculty fetch error", err);
          }
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [user.uid]);

  if (loading || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Card */}
      <View style={styles.card}>
        {profile.photoUrl ? (
          <Image source={{ uri: profile.photoUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholderAvatar}>
            <Text style={styles.placeholderText}>
              {profile.name ? profile.name[0].toUpperCase() : "?"}
            </Text>
          </View>
        )}
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text>Student ID: {profile.studentId || "Not assigned"}</Text>
          <Text>College ID: {profile.collegeId || "N/A"}</Text>
          <Text>{profile.collegeName}</Text>
          <Text>
            {profile.branch} - Year {profile.year}
          </Text>

          <Text style={{ marginTop: 8, fontWeight: "600" }}>Skills:</Text>
          {profile.skills?.length ? (
            <View style={styles.skillWrap}>
              {profile.skills.map((s, idx) => (
                <View key={idx} style={styles.skillChip}>
                  <Text style={styles.skillText}>{s}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text>No skills added yet</Text>
          )}

          {facultyName && (
            <Text style={{ marginTop: 6 }}>
              Faculty Coordinator: {facultyName}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: {
    flexDirection: "row",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  placeholderAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#bbb",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { fontSize: 36, fontWeight: "bold", color: "#fff" },
  name: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  skillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    gap: 6,
  },
  skillChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "#e8f5e9",
  },
  skillText: { fontSize: 12, fontWeight: "600" },
});
