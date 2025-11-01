import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCzIg0wUZG4JMEz8Tx23rp5klHf-UDJLPo",
  authDomain: "qr-review-6a098.firebaseapp.com",
  projectId: "qr-review-6a098",
  storageBucket: "qr-review-6a098.firebasestorage.app",
  messagingSenderId: "151138904455",
  appId: "1:151138904455:web:05a6723307deec67ec4b22",
  measurementId: "G-G5DE93FGRM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);