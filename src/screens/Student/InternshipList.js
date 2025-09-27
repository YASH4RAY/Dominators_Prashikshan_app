// src/screens/Student/InternshipList.js
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';
import { TouchableOpacity } from 'react-native';

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
      <View style={styles.headerGradient}>
        <Text style={styles.heading}>Available Internships</Text>
      </View>
      <FlatList
        data={internships}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const status = appliedMap[item.id];
          const applied = !!status;
          return (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title || 'Internship'}</Text>
              <Text style={styles.company}>Company: <Text style={styles.companyName}>{item.companyName || 'N/A'}</Text></Text>
              <Text style={styles.info}>Location: <Text style={styles.infoValue}>{item.location || 'N/A'}</Text></Text>
              <Text style={styles.info}>Mode: <Text style={styles.infoValue}>{item.mode || 'N/A'}</Text></Text>
              {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
              <TouchableOpacity
                style={[styles.applyBtn, applied && styles.applyBtnDisabled]}
                onPress={() => handleApply(item.id)}
                disabled={applied}
              >
                <Text style={styles.applyBtnText}>{applied ? `Applied (${status})` : 'Apply'}</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No internships yet.</Text>}
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
  headerGradient: {
    width: '100%',
    height: 90,
    backgroundColor: 'linear-gradient(90deg, #0b7cff 0%, #00c6fb 100%)',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    paddingBottom: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: -18,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  card: {
    marginVertical: 12,
    marginHorizontal: 18,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e3eaf2',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0b7cff',
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
    color: '#0b7cff',
  },
  info: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  infoValue: {
    fontWeight: '600',
    color: '#0b7cff',
  },
  desc: {
    marginTop: 8,
    color: '#222',
    fontSize: 14,
    marginBottom: 8,
  },
  applyBtn: {
    backgroundColor: '#0b7cff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#0b7cff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  applyBtnDisabled: {
    backgroundColor: '#b3d6ff',
    shadowOpacity: 0,
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
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
