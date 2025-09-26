// src/screens/Faculty/FacultyHome.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { AuthContext } from '../../context/AuthContext';

export default function FacultyHome() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ students: 0, logs: 0, certs: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const studentsSnap = await getDocs(query(collection(db, "users"), where("facultyId", "==", user.uid)));
      const logsSnap = await getDocs(query(collection(db, "logbooks"), where("facultyId", "==", user.uid)));
      const certsSnap = await getDocs(query(collection(db, "certificates"), where("status", "==", "pending")));

      setStats({
        students: studentsSnap.size,
        logs: logsSnap.size,
        certs: certsSnap.size,
      });
    };
    fetchStats();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Faculty Dashboard</Text>
      <Text>Assigned Students: {stats.students}</Text>
      <Text>Student Logs Pending: {stats.logs}</Text>
      <Text>Certificates Pending: {stats.certs}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
});
