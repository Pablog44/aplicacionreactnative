// Importamos las funciones necesarias de Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Configuración de Firebase (la misma que usas en tu proyecto web)
const firebaseConfig = {
    apiKey: "AIzaSyAr4e3jrQJjhCjBypkQsFljcwcbzrFJr9U",
    authDomain: "ojala-105b4.firebaseapp.com",
    projectId: "ojala-105b4",
    storageBucket: "ojala-105b4.appspot.com",
    messagingSenderId: "731806955770",
    appId: "1:731806955770:web:e4c4b2c3c7fdd1fc6db143"
  };

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Inicializamos el servicio de autenticación
const auth = getAuth(app);

// Exportamos el objeto de autenticación para usarlo en toda la app
export { auth };
