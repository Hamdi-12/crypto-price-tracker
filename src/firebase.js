// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAsMNg-nPCjNkuHgBJHHfSO9y_2CnKgfp4",
  authDomain: "crypto-price-tracker-9f8ee.firebaseapp.com",
  projectId: "crypto-price-tracker-9f8ee",
  storageBucket: "crypto-price-tracker-9f8ee.appspot.com",
  messagingSenderId: "377476730008",
  appId: "1:377476730008:web:141382c863ab03649f14ed",
  measurementId: "G-EJ23N05580"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
