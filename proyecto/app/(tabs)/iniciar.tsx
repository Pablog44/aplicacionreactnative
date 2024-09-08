import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome'; // Importa el ícono de FontAwesome

export default function Iniciar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Configura Google Sign-In
    GoogleSignin.configure({
      webClientId: '731806955770-iq18vumkbti2emeddin5rlb92fo0gu0h.apps.googleusercontent.com', // Reemplaza con tu webClientId de Google Cloud Console
      offlineAccess: true,
      forceCodeForRefreshToken: true,  // Asegura que se pueda iniciar sesión con una cuenta diferente
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut(); // Asegúrate de cerrar la sesión en Google Sign-In antes de iniciar una nueva
      const userInfo = await GoogleSignin.signIn();
      const { idToken } = userInfo;
      const googleCredential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, googleCredential);
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('El usuario canceló la autenticación');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('El proceso de autenticación ya está en curso');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Google Play Services no está disponible');
      } else {
        console.error('Error en la autenticación:', error);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await GoogleSignin.signOut(); // Cierra sesión de Google
      await auth.signOut(); // Cierra sesión de Firebase
      setUser(null); // Resetea el estado del usuario
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Función para obtener solo el primer nombre
  const getFirstName = (fullName: string | null | undefined) => {
    if (!fullName) return ''; // Si no hay nombre, retorna cadena vacía
    return fullName.split(' ')[0]; // Retorna la primera palabra del nombre
  };

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.welcomeText}>Bienvenido {getFirstName(user.displayName)}</Text> 
          <TouchableOpacity onPress={handleSignOut} style={styles.googleButton}>
            <Icon name="sign-out" size={32} color="#FFD700" />
          </TouchableOpacity>
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </>
      ) : (
        <>
          <TouchableOpacity onPress={signInWithGoogle} style={styles.googleButton}>
            <Icon name="google" size={32} color="#FFD700" />
          </TouchableOpacity>
          <Text style={styles.buttonText}>Iniciar sesión con Google</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212', // Fondo oscuro
  },
  googleButton: {
    width: 70,
    height: 70,
    backgroundColor: '#333333', // Color oscuro para el botón
    borderRadius: 35, // Hace el botón circular
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10, // Añade espacio entre el botón y el texto
  },
  buttonText: {
    fontSize: 18,
    color: '#FFD700', // Texto dorado
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: '#FFD700', // Texto dorado
    marginBottom: 10,
  },
});
