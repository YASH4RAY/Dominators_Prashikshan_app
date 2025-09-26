import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";   // ✅ just use this
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA_PCtVbID2YJ4AA_gmqYGrhOpmTJTYJg8",
  authDomain: "prashikshan-9b61a.firebaseapp.com",
  projectId: "prashikshan-9b61a",
  storageBucket: "prashikshan-9b61a.firebasestorage.app", 
  messagingSenderId: "1004338787118",
  appId: "1:1004338787118:web:313e5bd92d603fe2fc40bf",
  measurementId: "G-CNP6YBBEG7"
};



const app = initializeApp(firebaseConfig);

// ✅ Works fine in Expo without initializeAuth
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
