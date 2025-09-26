import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA_PCtVbID2YJ4AA_gmqYGrhOpmTJTYJg8",
  authDomain: "prashikshan-9b61a.firebaseapp.com",
  projectId: "prashikshan-9b61a",
  storageBucket: "prashikshan-9b61a.firebasestorage.app",
  messagingSenderId: "1004338787118",
  appId: "1:1004338787118:web:313e5bd92d603fe2fc40bf",
  measurementId: "G-CNP6YBBEG7"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;