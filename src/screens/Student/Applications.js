// src/screens/Student/Applications.js
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
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
        <Text>Loading applications...</Text>
      </View>
    );
  }

  // Helper for status color
  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted': return styles.statusAccepted;
      case 'rejected': return styles.statusRejected;
      default: return styles.statusPending;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.heading}>My Applications</Text>
      </View>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.internship?.title || 'Unknown Internship'}</Text>
            <Text style={styles.company}>Company: <Text style={styles.companyName}>{item.internship?.companyName || 'N/A'}</Text></Text>
            <Text style={styles.info}>Location: <Text style={styles.infoValue}>{item.internship?.location || 'N/A'}</Text></Text>
            <Text style={styles.info}>Mode: <Text style={styles.infoValue}>{item.internship?.mode || 'N/A'}</Text></Text>
            <View style={styles.statusRow}>
              <Text style={[styles.statusChip, getStatusStyle(item.status)]}>{item.status}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>You haven’t applied to any internships yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
    padding: 0,
  },
  headerBar: {
    width: '100%',
    height: 70,
    backgroundColor: '#4f3cc9',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    paddingBottom: 10,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginBottom: -10,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  cwrd: {
    marginVertical: 12,
    marginHorizontal: 18,
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#fff',
    shadowColor: '#4f3cc9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e3eaf2',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4f3cc9',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  company: {
    fontSize: 15,
    color: '#333',
    marginBottom: 2,
  },
  companyName: {
    fontWeight: '700',
    color: '#4f3cc9',
  },
  info: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  infoValue: {
    fontWeight: '600',
    color: '#4f3cc9',
  },
  statusRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 999,
    fontWeight: '700',
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.2,
    marginRight: 8,
    shadowColor: '#4f3cc9',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  statusAccepted: {
    backgroundColor: '#43c6ac',
  },
  statusRejected: {
    backgroundColor: '#f95f62',
  },
  statusPending: {
    backgroundColor: '#4f3cc9',
  },
  emptyText: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
