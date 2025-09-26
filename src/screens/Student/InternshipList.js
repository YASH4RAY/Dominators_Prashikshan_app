// src/screens/Student/InternshipList.js
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';

export default function InternshipList() {
  const { user } = useContext(AuthContext);
  const [internships, setInternships] = useState([]);
  const [appliedMap, setAppliedMap] = useState({}); // { [internshipId]: status }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // 1) list internships (verified only if you use that flag)
        const intsSnap = await getDocs(collection(db, 'internships'));
        const ints = intsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // 2) fetch student's existing applications to disable Apply
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
        status: 'pending',              // faculty/college can later change to accepted/rejected
        appliedAt: serverTimestamp(),
      });
      setAppliedMap(prev => ({ ...prev, [internshipId]: 'pending' }));
      Alert.alert('Applied', 'Application sent for verification.');
    } catch (err) {
      console.warn('apply error', err);
      Alert.alert('Apply failed', err.message || String(err));
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Available Internships</Text>
      <FlatList
        data={internships}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const status = appliedMap[item.id];
          const applied = !!status;
          return (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title || 'Internship'}</Text>
              <Text>Company: {item.companyName || 'N/A'}</Text>
              <Text>Location: {item.location || 'N/A'}</Text>
              <Text>Mode: {item.mode || 'N/A'}</Text>
              {item.description ? <Text style={{ marginTop: 6 }}>{item.description}</Text> : null}
              <View style={{ marginTop: 10 }}>
                <Button
                  title={applied ? `Applied (${status})` : 'Apply'}
                  onPress={() => handleApply(item.id)}
                  disabled={applied}
                />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={{ color: '#666' }}>No internships yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  card: {
    marginVertical: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  title: { fontSize: 16, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
