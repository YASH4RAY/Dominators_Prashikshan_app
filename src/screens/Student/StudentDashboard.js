// src/screens/Student/StudentDashboard.js
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, Linking, ProgressBarAndroid, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { storage, db } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';

/* Helper: try XHR to fetch blob - works for some content:// URIs */
function fetchBlobWithXHR(uri) {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', uri, true);
      xhr.responseType = 'blob';
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 0) {
          resolve(xhr.response);
        } else {
          reject(new Error('XHR status ' + xhr.status));
        }
      };
      xhr.onerror = () => reject(new Error('XHR error while fetching file'));
      xhr.send();
    } catch (err) {
      reject(err);
    }
  });
}

/* Guess a basic mime type from filename ext */
function getMimeType(filename) {
  const ext = filename?.split?.('.').pop()?.toLowerCase() || '';
  const map = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return map[ext] || 'application/octet-stream';
}

export default function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const uid = user?.uid;
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [certs, setCerts] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'certificates'), where('studentId', '==', uid));
    const unsub = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
      arr.sort((a,b) => {
        const ta = a.uploadedAt?.toMillis ? a.uploadedAt.toMillis() : 0;
        const tb = b.uploadedAt?.toMillis ? b.uploadedAt.toMillis() : 0;
        return tb - ta;
      });
      setCerts(arr);
      setLoadingList(false);
    }, (err) => {
      console.warn('certs listen error', err);
      setLoadingList(false);
    });

    return () => unsub();
  }, [uid]);

  const uploadCertificate = async () => {
    try {
      // IMPORTANT: copyToCacheDirectory:true makes DocumentPicker return a file:// URI on Android too
      const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (res.type === 'cancel') return;
      if (!uid) return Alert.alert('Not signed in');

      setUploading(true);
      setProgress(0);

      const uri = res.uri;
      const filename = res.name || `${Date.now()}-certificate`;
      const mimeType = getMimeType(filename);

      let blob = null;

      // 1) Primary: fetch -> blob (works when uri is file://)
      try {
        const r = await fetch(uri);
        blob = await r.blob();
      } catch (err) {
        console.warn('fetch->blob failed, trying XHR fallback', err);
      }

      // 2) Fallback: try XHR (helps with some content:// URIs on Android)
      if (!blob) {
        try {
          blob = await fetchBlobWithXHR(uri);
        } catch (err) {
          console.warn('XHR fallback failed', err);
        }
      }

      // 3) Last-resort fallback: read base64 using expo-file-system and convert to blob via fetch(dataUrl)
      if (!blob) {
        try {
          // use string 'base64' to avoid relying on FileSystem.EncodingType
          const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
          const dataUrl = `data:${mimeType};base64,${base64}`;
          const fetchRes = await fetch(dataUrl);
          blob = await fetchRes.blob();
        } catch (err) {
          console.warn('FileSystem fallback failed', err);
        }
      }

      if (!blob) {
        throw new Error('Could not read file as blob. Try testing on a physical device (Expo Go) rather than an emulator.');
      }

      // Create storage ref and upload with resumable task to monitor progress
      const storageRef = ref(storage, `certificates/${uid}/${filename}`);

      const uploadTask = uploadBytesResumable(storageRef, blob, { contentType: mimeType });

      uploadTask.on('state_changed',
        (snapshot) => {
          const pct = (snapshot.bytesTransferred / snapshot.totalBytes) || 0;
          setProgress(pct);
        },
        (uploadError) => {
          console.warn('uploadTask error', uploadError);
          Alert.alert('Upload failed', uploadError.message || String(uploadError));
          setUploading(false);
          setProgress(0);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            await addDoc(collection(db, 'certificates'), {
              studentId: uid,
              fileName: filename,
              fileUrl: url,
              status: 'pending',
              uploadedAt: serverTimestamp()
            });
            Alert.alert('Uploaded', 'Certificate uploaded and sent for verification.');
          } catch (err) {
            console.warn('post-upload error', err);
            Alert.alert('Upload completed but saving metadata failed', err.message || String(err));
          } finally {
            setUploading(false);
            setProgress(0);
          }
        }
      );

    } catch (err) {
      console.warn('upload err', err);
      Alert.alert('Upload error', err.message || String(err));
      setUploading(false);
      setProgress(0);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.certItem}>
      <View style={{flex:1}}>
        <Text style={{fontWeight:'600'}}>{item.fileName || 'Certificate'}</Text>
        <Text style={{color:'#666', marginTop:4}}>Status: {item.status}</Text>
        <Text style={{color:'#666', marginTop:2, fontSize:12}}>
          Uploaded: {item.uploadedAt?.toDate ? item.uploadedAt.toDate().toLocaleString() : ''}
        </Text>
      </View>

      <View style={{justifyContent:'space-between', alignItems:'flex-end'}}>
        <TouchableOpacity style={styles.openBtn} onPress={() => item.fileUrl ? Linking.openURL(item.fileUrl) : Alert.alert('No URL')}>
          <Text style={{color:'#fff'}}>Open</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>Student Dashboard</Text>
        <Text style={styles.welcome}>Welcome, <Text style={{fontWeight:'700'}}>{user?.email}</Text></Text>
      </View>

      <TouchableOpacity style={[styles.uploadBtn, uploading && {opacity:0.7}]} onPress={uploadCertificate} disabled={uploading}>
        <Text style={styles.uploadBtnText}>{uploading ? 'Uploading...' : 'Upload Certificate for Verification'}</Text>
      </TouchableOpacity>

      {uploading && (
        <View style={styles.progressWrap}>
          {Platform.OS === 'android' ? (
            <ProgressBarAndroid styleAttr="Horizontal" indeterminate={false} progress={progress} />
          ) : (
            <Text style={styles.progressText}>Progress: {(progress*100).toFixed(0)}%</Text>
          )}
        </View>
      )}

      <Text style={styles.sectionTitle}>Your Certificates</Text>

      {loadingList ? (
        <ActivityIndicator style={{marginTop:12}} />
      ) : certs.length === 0 ? (
        <Text style={styles.emptyText}>No certificates uploaded yet.</Text>
      ) : (
        <FlatList
          data={certs}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          style={{width:'100%', marginTop:12}}
        />
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#f4f7fb',
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0b7cff',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  welcome: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  uploadBtn: {
    backgroundColor: 'linear-gradient(90deg, #0b7cff 0%, #00c6fb 100%)',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#0b7cff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  uploadBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  progressWrap: {
    marginTop: 10,
    width: '100%',
  },
  progressText: {
    color: '#0b7cff',
    marginTop: 6,
    fontWeight: '600',
  },
  sectionTitle: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
  },
  emptyText: {
    marginTop: 12,
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
  },
  certItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e3eaf2',
  },
  openBtn: {
    backgroundColor: '#0b7cff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#0b7cff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 1,
  },
  logoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e3eaf2',
  },
  logoutBtnText: {
    color: '#0b7cff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
