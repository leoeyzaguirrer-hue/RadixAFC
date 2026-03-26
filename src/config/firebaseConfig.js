import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUDJ6BJQybGNwhT2EOpn1rijzVyPDro-Q",
  authDomain: "radixafc.firebaseapp.com",
  projectId: "radixafc",
  storageBucket: "radixafc.firebasestorage.app",
  messagingSenderId: "1029503448940",
  appId: "1:1029503448940:web:f56f30262ca4f233e9e549",
  measurementId: "G-PKSKTMH7SE",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
