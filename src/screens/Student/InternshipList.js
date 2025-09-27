// src/screens/Student/InternshipList.js
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';

export default function InternshipList() {
  const { user } = useContext(AuthContext);
  const [internships, setInternships] = useState([]);
  const [appliedMap, setAppliedMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const intsSnap = await getDocs(collection(db, 'internships'));
        const ints = intsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const appsQ = query(collection(db, 'applications'), where('studentId', '==', user.uid));
        const appsSnap = await getDocs(appsQ);
        const map = {};
        appsSnap.forEach(d => {
          const a = d.data();
          map[a.internshipId] = a.status || 'pending';
        });

        setInternships(ints);
        setAppliedMap(map);
      } catch (err) {
        console.warn('internships load error', err);
        Alert.alert('Error', err.message || String(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.uid]);

  const handleApply = async (internshipId) => {
    if (appliedMap[internshipId]) {
      return Alert.alert('Already applied', `Status: ${appliedMap[internshipId]}`);
    }
    try {
      await addDoc(collection(db, 'applications'), {
        studentId: user.uid,
        internshipId,
        status: 'pending',
        appliedAt: serverTimestamp(),
      });
      setAppliedMap(prev => ({ ...prev, [internshipId]: 'pending' }));
      Alert.alert('✅ Applied', 'Application sent for verification.');
    } catch (err) {
      console.warn('apply error', err);
      Alert.alert('Apply failed', err.message || String(err));
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0b7cff" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Loading internships...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>💼 Available Internships</Text>
      <FlatList
        data={internships}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const status = appliedMap[item.id];
          const applied = !!status;
          return (
            <View style={styles.card}>
              <Text style={styles.title}>🏢 {item.title || 'Internship'}</Text>
              <Text style={styles.info}>👔 Company: <Text style={styles.infoValue}>{item.companyName || 'N/A'}</Text></Text>
              <Text style={styles.info}>📍 Location: <Text style={styles.infoValue}>{item.location || 'N/A'}</Text></Text>
              <Text style={styles.info}>🖥️ Mode: <Text style={styles.infoValue}>{item.mode || 'N/A'}</Text></Text>
              {item.description ? <Text style={styles.desc}>📝 {item.description}</Text> : null}
              <View style={{ marginTop: 10 }}>
                <Button
                  title={applied ? `✅ Applied (${status})` : 'Apply 🚀'}
                  onPress={() => handleApply(item.id)}
                  disabled={applied}
                  color={applied ? "#aaa" : "#0b7cff"}
                />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.noInternships}>😕 No internships yet. Check back soon!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f8ff" },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 14, color: "#0b7cff" },
  card: {
    marginVertical: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e3e8f0',
    borderRadius: 14,
    backgroundColor: '#fff',
    shadowColor: "#0b7cff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: "#1976D2", marginBottom: 4 },
  info: { fontSize: 15, color: "#374151", marginBottom: 2 },
  infoValue: { fontWeight: "700", color: "#0b7cff" },
  desc: { marginTop: 6, color: "#444", fontSize: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noInternships: { color: '#888', fontStyle: 'italic', marginTop: 24, textAlign: "center" },
});
