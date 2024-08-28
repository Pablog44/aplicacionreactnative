import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';

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
    } catch (error: any) { // Cambiado a "any" para evitar problemas con TypeScript
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

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.welcomeText}>Bienvenido, {user.displayName}</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.button}>
            <Text style={styles.buttonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity onPress={signInWithGoogle} style={styles.button}>
          <Text style={styles.buttonText}>Iniciar sesión con Google</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 20,
    backgroundColor: 'green',
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
  },
  welcomeText: {
    fontSize: 18,
    color: 'black',
    marginBottom: 10,
  },
});
