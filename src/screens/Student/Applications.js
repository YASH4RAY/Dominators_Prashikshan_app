// src/screens/Student/Applications.js
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, query, where, onSnapshot, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';

export default function Applications() {
  const { user } = useContext(AuthContext);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'applications'),
      where('studentId', '==', user.uid),
      // optional ordering if you store appliedAt
      // orderBy('appliedAt', 'desc')
    );

    const unsub = onSnapshot(q, async (snap) => {
      const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // join internship details
      const enriched = await Promise.all(apps.map(async (a) => {
        if (!a.internshipId) return { ...a, internship: null };
        try {
          const iSnap = await getDoc(doc(db, 'internships', a.internshipId));
          return { ...a, internship: iSnap.exists() ? iSnap.data() : null };
        } catch {
          return { ...a, internship: null };
        }
      }));
      setRows(enriched);
      setLoading(false);
    }, (err) => {
      console.warn('apps listen error', err);
      setLoading(false);
    });

    return () => unsub();
  }, [user?.uid]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Applications</Text>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.internship?.title || 'Unknown Internship'}</Text>
            <Text>Company: {item.internship?.companyName || 'N/A'}</Text>
            <Text>Location: {item.internship?.location || 'N/A'}</Text>
            <Text>Mode: {item.internship?.mode || 'N/A'}</Text>
            <Text style={styles.status}>Status: {item.status}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#666' }}>You haven’t applied to any internships yet.</Text>}
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
  status: { marginTop: 8, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
