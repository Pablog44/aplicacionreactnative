import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const saveHighScore = async (newScore, user, gridSize) => {
  if (gridSize === undefined || gridSize === null) {
    console.error('El tamaño de la cuadrícula (gridSize) es indefinido o nulo.');
    return;
  }

  try {
    await addDoc(collection(db, 'records'), {
      score: newScore,
      timestamp: new Date(),
      userId: user ? user.uid : 'anon',
      userName: user ? user.displayName : 'Anónimo',
      gridSize: gridSize, // Guardar el tamaño de la cuadrícula
    });

    return await fetchHighScores(gridSize); // Pasar el gridSize al obtener los records
  } catch (error) {
    console.error('Error guardando el score en Firestore: ', error);
    return [];
  }
};

export const fetchHighScores = async (gridSize) => {
  try {
    const q = query(
      collection(db, 'records'),
      where('gridSize', '==', gridSize), // Filtrar por el tamaño de la cuadrícula
      orderBy('score', 'desc'),
      limit(20)
    );
    const querySnapshot = await getDocs(q, { source: 'server' });

    return querySnapshot.docs.map(doc => ({
      score: doc.data().score,
      gridSize: doc.data().gridSize,
      date: doc.data().timestamp.toDate(),
      userName: doc.data().userName,
    }));
  } catch (error) {
    console.error('Error obteniendo los scores de Firestore: ', error);
    return [];
  }
};
