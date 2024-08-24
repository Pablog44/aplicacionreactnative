import { GoogleAuthProvider, signInWithPopup, getAuth, signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    // Puedes obtener el token si lo necesitas
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    // Información del usuario
    const user = result.user;
    console.log('Usuario autenticado:', user);
    return user;
  } catch (error) {
    console.error('Error al autenticar con Google:', error);
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('Usuario deslogueado');
  } catch (error) {
    console.error('Error al desloguear:', error);
  }
};
