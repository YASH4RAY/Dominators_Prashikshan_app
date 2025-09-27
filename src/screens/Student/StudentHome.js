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
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.infoText}>Student ID: <Text style={styles.infoValue}>{profile.studentId || "Not assigned"}</Text></Text>
          <Text style={styles.infoText}>College ID: <Text style={styles.infoValue}>{profile.collegeId || "N/A"}</Text></Text>
          <Text style={styles.infoText}>{profile.collegeName}</Text>
          <Text style={styles.infoText}>{profile.branch} - Year {profile.year}</Text>

          <Text style={styles.skillTitle}>Skills:</Text>
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

          {facultyName && (
            <Text style={styles.facultyText}>Faculty Coordinator: <Text style={styles.infoValue}>{facultyName}</Text></Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  skillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 8,
  },
  skillChip: {
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
  },
});
