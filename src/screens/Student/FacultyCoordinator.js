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
      <Text style={styles.heading}>👨‍🏫 Faculty Coordinator</Text>
      {faculty ? (
        <View style={styles.facultyCard}>
          <Text style={styles.info}>Coordinator: <Text style={styles.facultyName}>{faculty.name}</Text></Text>
          {faculty.email && <Text style={styles.email}>✉️ {faculty.email}</Text>}
        </View>
      ) : (
        <Text style={styles.noFaculty}>No faculty assigned yet. 🕵️‍♂️</Text>
      )}
      <Text style={styles.subheading}>📝 Your Plans</Text>
      <FlatList
        data={plans}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.planCard}>
            <Text style={styles.planText}>📌 {item.plan}</Text>
            <Text style={styles.planDate}>
              {item.createdAt
                ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
                : ""}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noPlans}>No plans found. Start planning your goals! 🚀</Text>
        }
        contentContainerStyle={plans.length === 0 && { flex: 1, justifyContent: "center" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: "#f5f8ff" },
  heading: { fontSize: 22, fontWeight: "bold", color: "#0b7cff", marginBottom: 10 },
  facultyCard: {
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#0b7cff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  info: { fontSize: 16, color: "#222", marginBottom: 2 },
  facultyName: { color: "#1976D2", fontWeight: "bold" },
  email: { color: "#374151", fontSize: 14, marginTop: 2 },
  noFaculty: { color: "#888", fontStyle: "italic", marginBottom: 12 },
  subheading: { marginTop: 16, fontWeight: "bold", fontSize: 18, color: "#1976D2" },
  planCard: {
    marginVertical: 8,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e3e8f0",
    shadowColor: "#0b7cff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  planText: { fontSize: 16, color: "#222", marginBottom: 4 },
  planDate: { fontSize: 12, color: "#888" },
  noPlans: { color: "#888", fontStyle: "italic", marginTop: 24, textAlign: "center" },
});
