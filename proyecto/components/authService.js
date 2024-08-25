import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export const signOutUser = async () => {
  try {
    await auth.signOut();
    console.log('Usuario deslogueado');
  } catch (error) {
    console.error('Error al desloguear:', error);
  }
};
