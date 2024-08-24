import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebaseConfig.js';

export const saveHighScore = async (newScore) => {
  try {
    await addDoc(collection(db, 'highScores'), { score: newScore, timestamp: new Date() });
    return await fetchHighScores(); // Retornamos la lista actualizada de puntuaciones
  } catch (error) {
    console.error("Error guardando el score en Firestore: ", error);
    return [];
  }
};

export const fetchHighScores = async () => {
  try {
    // Limitamos los resultados a 20 y los ordenamos por la puntuación y la fecha
    const q = query(collection(db, 'highScores'), orderBy('score', 'desc'), limit(20));
    const querySnapshot = await getDocs(q, { source: 'server' });
    return querySnapshot.docs.map(doc => ({
      score: doc.data().score,
      date: doc.data().timestamp.toDate(), // Convertimos la fecha a un formato Date
    }));
  } catch (error) {
    console.error("Error obteniendo los scores de Firestore: ", error);
    return [];
  }
};
