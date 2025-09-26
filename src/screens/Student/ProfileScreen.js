import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setProfile(snap.data());
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, profile);
    alert("Profile updated!");
  };

  if (!profile) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Profile</Text>
      <TextInput
        style={styles.input}
        value={profile.name}
        onChangeText={(val) => setProfile({ ...profile, name: val })}
        placeholder="Name"
      />
      <TextInput
        style={styles.input}
        value={profile.skills?.join(", ")}
        onChangeText={(val) => setProfile({ ...profile, skills: val.split(",") })}
        placeholder="Skills (comma separated)"
      />
      <TextInput
        style={styles.input}
        value={profile.domains?.join(", ")}
        onChangeText={(val) => setProfile({ ...profile, domains: val.split(",") })}
        placeholder="Domains of interest"
      />
      <Button title="Save Changes" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 12,
    borderRadius: 6,
  },
});
