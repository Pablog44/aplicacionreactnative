import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'; // <- quitar "/react-native"
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC_VxeXPdAtORGQeCFw679B0d9pb32ng_w",
  authDomain: "ojala-105b4.firebaseapp.com",
  projectId: "ojala-105b4",
  storageBucket: "ojala-105b4.appspot.com",
  messagingSenderId: "731806955770",
  appId: "1:731806955770:android:d82134d3c1a381af6db143",
};

const app = initializeApp(firebaseConfig);

// Inicializa Auth con persistencia
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Inicializa Firestore
const db = getFirestore(app);

export { auth, db };
