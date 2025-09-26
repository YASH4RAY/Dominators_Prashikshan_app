// src/screens/Company/CompanyHome.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { AuthContext } from '../../context/AuthContext';

export default function CompanyHome() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ internships: 0, applicants: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const q = query(collection(db, "internships"), where("companyId", "==", user.uid));
      const internshipsSnap = await getDocs(q);

      let applicantCount = 0;
      for (let doc of internshipsSnap.docs) {
        const appsSnap = await getDocs(
          query(collection(db, "applications"), where("internshipId", "==", doc.id))
        );
        applicantCount += appsSnap.size;
      }

      setStats({ internships: internshipsSnap.size, applicants: applicantCount });
    };
    fetchStats();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Company Dashboard</Text>
      <Text>Total Internships Posted: {stats.internships}</Text>
      <Text>Total Applicants: {stats.applicants}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
});
