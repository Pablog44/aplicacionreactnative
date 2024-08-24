// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuración de Firebase extraída de google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyC_VxeXPdAtORGQeCFw679B0d9pb32ng_w",
  authDomain: "ojala-105b4.firebaseapp.com",
  projectId: "ojala-105b4",
  storageBucket: "ojala-105b4.appspot.com",
  messagingSenderId: "731806955770",
  appId: "1:731806955770:android:d82134d3c1a381af6db143",
};

const app = initializeApp(firebaseConfig);

// Inicializar Firestore y Auth
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
