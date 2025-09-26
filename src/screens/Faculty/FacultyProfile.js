import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, ActivityIndicator } from "react-native";
import { db } from "../../config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";

export default function FacultyProfile() {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) setProfile(snap.data());
    });
    return () => unsub();
  }, [user.uid]);

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
      <Text style={styles.title}>{profile.name}</Text>
      <Text>Faculty ID: {profile.facultyId}</Text>
      <Text>Profession: {profile.profession}</Text>
      <Text>Department: {profile.department}</Text>
      <Text>Branch: {profile.branch}</Text>
      <Text>College: {profile.collegeName}</Text>

      <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={logout} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  logoutContainer: { marginTop: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
