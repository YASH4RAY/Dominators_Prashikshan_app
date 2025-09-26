import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { db } from "../../config/firebase";
import { doc, getDoc, query, where, collection, getDocs } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";

export default function FacultyCoordinator() {
  const { user } = useContext(AuthContext);
  const [faculty, setFaculty] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchFaculty = async () => {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists()) {
        const facultyId = userSnap.data().facultyId;
        if (facultyId) {
          const facSnap = await getDoc(doc(db, "users", facultyId));
          if (facSnap.exists()) setFaculty(facSnap.data());
        }
      }
    };

    const fetchPlans = async () => {
      const q = query(collection(db, "plans"), where("studentId", "==", user.uid));
      const snap = await getDocs(q);
      setPlans(snap.docs.map((d) => d.data()));
    };

    fetchFaculty();
    fetchPlans();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Faculty Coordinator</Text>
      {faculty ? (
        <Text style={styles.info}>Coordinator: {faculty.name}</Text>
      ) : (
        <Text>No faculty assigned yet.</Text>
      )}
      <Text style={styles.subheading}>Plans</Text>
      <FlatList
        data={plans}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.planCard}>
            <Text>{item.plan}</Text>
            <Text style={{ fontSize: 12, color: "gray" }}>{String(item.createdAt)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  heading: { fontSize: 20, fontWeight: "bold" },
  subheading: { marginTop: 12, fontWeight: "bold" },
  info: { fontSize: 16, marginVertical: 6 },
  planCard: { marginVertical: 6, padding: 8, backgroundColor: "#f9f9f9", borderRadius: 6 },
});
