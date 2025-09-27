// src/screens/Student/StudentHome.js
import React, { useEffect, useState, useContext } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
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
        <ActivityIndicator size="large" color="#0b7cff" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
<<<<<<< HEAD
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Greeting */}
      <Text style={styles.greeting}>👋 Welcome back, <Text style={{ color: "#0b7cff", fontWeight: "bold" }}>{profile.name}</Text>!</Text>

      {/* Profile Card */}
=======
    <View style={styles.container}>
>>>>>>> f68b3469f9b2e216a672f073bf01c2425c9cb7c8
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
<<<<<<< HEAD
        <View style={{ marginLeft: 18, flex: 1 }}>
          <Text style={styles.name}>🎓 {profile.name}</Text>
          <Text style={styles.info}>🆔 Student ID: <Text style={styles.infoValue}>{profile.studentId || "Not assigned"}</Text></Text>
          <Text style={styles.info}>🏫 College ID: <Text style={styles.infoValue}>{profile.collegeId || "N/A"}</Text></Text>
          <Text style={styles.info}>🏢 {profile.collegeName}</Text>
          <Text style={styles.info}>📚 {profile.branch} - Year {profile.year}</Text>

          <Text style={styles.skillLabel}>💡 Skills:</Text>
=======
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.infoText}>Student ID: <Text style={styles.infoValue}>{profile.studentId || "Not assigned"}</Text></Text>
          <Text style={styles.infoText}>College ID: <Text style={styles.infoValue}>{profile.collegeId || "N/A"}</Text></Text>
          <Text style={styles.infoText}>{profile.collegeName}</Text>
          <Text style={styles.infoText}>{profile.branch} - Year {profile.year}</Text>

          <Text style={styles.skillTitle}>Skills:</Text>
>>>>>>> f68b3469f9b2e216a672f073bf01c2425c9cb7c8
          {profile.skills?.length ? (
            <View style={styles.skillWrap}>
              {profile.skills.map((s, idx) => (
                <View key={idx} style={styles.skillChip}>
                  <Text style={styles.skillText}>✨ {s}</Text>
                </View>
              ))}
            </View>
          ) : (
<<<<<<< HEAD
            <Text style={styles.noSkills}>No skills added yet. 🚀</Text>
          )}

          {facultyName && (
            <Text style={styles.faculty}>👨‍🏫 Faculty Coordinator: <Text style={styles.infoValue}>{facultyName}</Text></Text>
=======
            <Text style={styles.noSkillText}>No skills added yet</Text>
          )}

          {facultyName && (
            <Text style={styles.facultyText}>Faculty Coordinator: <Text style={styles.infoValue}>{facultyName}</Text></Text>
>>>>>>> f68b3469f9b2e216a672f073bf01c2425c9cb7c8
          )}
        </View>
      </View>

      {/* Motivational Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🌟 Keep learning and growing! Your journey to success starts here. 🚀
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1, backgroundColor: "#f5f8ff", padding: 20 },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#222",
    letterSpacing: 0.2,
  },
  card: {
    flexDirection: "row",
    padding: 20,
    borderWidth: 1,
    borderColor: "#e3e8f0",
    borderRadius: 18,
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#0b7cff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: "#0b7cff" },
  placeholderAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#bbb",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0b7cff",
  },
  placeholderText: { fontSize: 36, fontWeight: "bold", color: "#fff" },
  name: { fontSize: 20, fontWeight: "bold", marginBottom: 4, color: "#0b7cff" },
  info: { fontSize: 15, color: "#374151", marginBottom: 2 },
  infoValue: { fontWeight: "700", color: "#0b7cff" },
  skillLabel: { marginTop: 10, fontWeight: "600", color: "#222", fontSize: 15 },
=======
  container: {
    flex: 1,
    padding: 22,
    backgroundColor: '#f4f7fb',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e3eaf2',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#0b7cff',
    backgroundColor: '#eaf4ff',
  },
  placeholderAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0b7cff',
  },
  placeholderText: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    marginLeft: 18,
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    color: '#0b7cff',
    letterSpacing: 0.3,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 2,
  },
  infoValue: {
    fontWeight: '700',
    color: '#0b7cff',
  },
  skillTitle: {
    marginTop: 12,
    fontWeight: '700',
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
  },
>>>>>>> f68b3469f9b2e216a672f073bf01c2425c9cb7c8
  skillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 8,
  },
  skillChip: {
<<<<<<< HEAD
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
  faculty: { marginTop: 10, color: "#1976D2", fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  footer: {
    marginTop: 32,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
  },
  footerText: {
    color: "#1976D2",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
=======
    paddingVertical: 6,
    paddingHorizontal: 14,
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
    fontSize: 13,
    fontWeight: '700',
    color: '#0b7cff',
    letterSpacing: 0.2,
  },
  noSkillText: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
  },
  facultyText: {
    marginTop: 10,
    fontWeight: '600',
    color: '#333',
    fontSize: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
>>>>>>> f68b3469f9b2e216a672f073bf01c2425c9cb7c8
  },
});
