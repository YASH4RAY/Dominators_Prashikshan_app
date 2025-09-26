// src/screens/Student/StudentHome.js
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';

// small profile card component (could be in separate file)
function ProfileCard({ profile }) {
  return (
    <View style={styles.profileCard}>
      <Text style={styles.name}>{profile?.name || 'Student'}</Text>
      <Text style={styles.sub}>{profile?.collegeName || ''} • {profile?.branch || ''} • {profile?.year || ''}</Text>
      <Text style={styles.skills}>Skills: {profile?.skills?.join(', ') || '—'}</Text>
    </View>
  );
}

export default function StudentHome({ navigation }) {
  const { user } = useContext(AuthContext);
  const uid = user?.uid;
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [appliedCount, setAppliedCount] = useState(0);
  const [activeInternships, setActiveInternships] = useState([]);
  const [suggestedCourses, setSuggestedCourses] = useState([]);
  const [loadingMain, setLoadingMain] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const load = async () => {
      setLoadingProfile(true);
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) setProfile(snap.data());
      } catch (err) {
        console.warn('profile load', err);
      } finally {
        setLoadingProfile(false);
      }

      // load internship stats: how many applications by student
      try {
        const appsQ = query(collection(db, 'applications'), where('studentId', '==', uid));
        const appsSnap = await getDocs(appsQ);
        setAppliedCount(appsSnap.size);
      } catch (err) {
        console.warn('apps count', err);
      }

      // load active internships applied to (simple approach: fetch latest verified internships)
      try {
        const intQ = query(collection(db, 'internships'), where('verified', '==', true), limit(6));
        const ints = await getDocs(intQ);
        const arr = [];
        ints.forEach(d => arr.push({ id: d.id, ...d.data() }));
        setActiveInternships(arr);
      } catch (err) {
        console.warn('internships load', err);
      }

      // suggested courses: match top skill or domain to courses
      try {
        const topSkill = (profile?.skills && profile.skills[0]) || null;
        let coursesQ;
        if (topSkill) {
          coursesQ = query(collection(db, 'courses'), where('skillsCovered', 'array-contains', topSkill), limit(5));
        } else {
          coursesQ = query(collection(db, 'courses'), limit(5));
        }
        const cSnap = await getDocs(coursesQ);
        const cs = [];
        cSnap.forEach(d => cs.push({ id: d.id, ...d.data() }));
        setSuggestedCourses(cs);
      } catch (err) {
        console.warn('courses load', err);
      }

      setLoadingMain(false);
    };

    load();
  }, [uid, profile?.skills]);

  if (loadingProfile || loadingMain) {
    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfileCard profile={profile} />

      <View style={styles.section}>
        <Text style={styles.heading}>Internship Tracking</Text>
        <Text style={{marginTop:6}}>Applied: {appliedCount}</Text>
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Applications')}>
          <Text style={{color:'#0b7cff'}}>View applications</Text>
        </TouchableOpacity>

        <Text style={[styles.subheading, {marginTop:12}]}>Recommended Openings</Text>
        <FlatList
          data={activeInternships}
          keyExtractor={(i) => i.id}
          horizontal
          renderItem={({item}) => (
            <View style={styles.jobCard}>
              <Text style={{fontWeight:'700'}}>{item.title}</Text>
              <Text style={{fontSize:12,color:'#666',marginTop:6}}>{item.companyName}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={{color:'#666'}}>No active internships found.</Text>}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Courses Suggested</Text>
        <FlatList
          data={suggestedCourses}
          keyExtractor={(i) => i.id}
          renderItem={({item}) => (
            <View style={styles.courseCard}>
              <Text style={{fontWeight:'700'}}>{item.title}</Text>
              <Text style={{fontSize:12,color:'#666',marginTop:6}} numberOfLines={2}>{item.description}</Text>
              <TouchableOpacity style={styles.courseBtn} onPress={() => {/* you can open course content */}}>
                <Text style={{color:'#0b7cff'}}>Open</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={{color:'#666'}}>No suggested courses yet.</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:16},
  profileCard:{padding:14,backgroundColor:'#f5f8ff',borderRadius:10,marginBottom:12},
  name:{fontSize:18,fontWeight:'800'},
  sub:{color:'#555',marginTop:6},
  skills:{marginTop:8,color:'#333'},

  section:{marginTop:12},
  heading:{fontSize:16,fontWeight:'800'},
  subheading:{fontSize:14,fontWeight:'700'},

  jobCard:{padding:10,backgroundColor:'#fff',borderRadius:8,marginRight:12,shadowColor:'#000',shadowOpacity:0.03,shadowRadius:4,elevation:1,width:200},
  courseCard:{padding:10,backgroundColor:'#fff',borderRadius:8,marginBottom:10},

  link:{marginTop:6}
});
