import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

export default function Iniciar() {
  const [user, setUser] = useState<User | null>(null);

  // Configuración de Google Auth Request usando useIdTokenAuthRequest
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '731806955770-1hne8mc1kq5dvc16ntpm5pfhvbpq2bi8.apps.googleusercontent.com',
    androidClientId: '731806955770-rdn2614jodtaludlj2lk6js6qti4ulr5.apps.googleusercontent.com',
    webClientId: '731806955770-iq18vumkbti2emeddin5rlb92fo0gu0h.apps.googleusercontent.com',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          console.log('Usuario autenticado:', userCredential.user);
        })
        .catch((error) => {
          console.error('Error al autenticar con Google:', error);
        });
    }
  }, [response]);

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.welcomeText}>Bienvenido, {user.displayName}</Text>
          <TouchableOpacity onPress={async () => await auth.signOut()} style={styles.button}>
            <Text style={styles.buttonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity onPress={() => promptAsync()} style={styles.button}>
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
