// src/screens/College/CollegeHome.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function CollegeHome() {
  const [stats, setStats] = useState({ students: 0, internships: 0, pendingCerts: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const studentsSnap = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
      const internshipsSnap = await getDocs(collection(db, "internships"));
      const certsSnap = await getDocs(query(collection(db, "certificates"), where("status", "==", "pending")));

      setStats({
        students: studentsSnap.size,
        internships: internshipsSnap.size,
        pendingCerts: certsSnap.size,
      });
    };
    fetchStats();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>College Dashboard</Text>
      <Text>Students: {stats.students}</Text>
      <Text>Internships Posted: {stats.internships}</Text>
      <Text>Pending Certificates: {stats.pendingCerts}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
});
