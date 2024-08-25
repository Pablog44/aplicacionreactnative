import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const saveHighScore = async (newScore, user) => {
  try {
    await addDoc(collection(db, 'highScores'), {
      score: newScore,
      timestamp: new Date(),
      userId: user ? user.uid : 'anon',
      userName: user ? user.displayName : 'Anónimo',
    });
    return await fetchHighScores();
  } catch (error) {
    console.error('Error guardando el score en Firestore: ', error);
    return [];
  }
};

export const fetchHighScores = async () => {
  try {
    const q = query(collection(db, 'highScores'), orderBy('score', 'desc'), limit(20));
    const querySnapshot = await getDocs(q, { source: 'server' });
    return querySnapshot.docs.map(doc => ({
      score: doc.data().score,
      date: doc.data().timestamp.toDate(),
    }));
  } catch (error) {
    console.error('Error obteniendo los scores de Firestore: ', error);
    return [];
  }
};
