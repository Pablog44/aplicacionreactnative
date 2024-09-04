import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Guardar el high score
export const saveHighScore = async (newScore, user, gridSize) => {
  if (!gridSize) {
    console.error('El tamaño de la cuadrícula (gridSize) es indefinido o nulo.');
    return [];
  }

  try {
    // Agregar el récord a la colección 'records'
    await addDoc(collection(db, 'records'), {
      score: newScore,
      timestamp: new Date(),  // Guardar la fecha y hora actual
      userId: user ? user.uid : 'anon',  // Si no hay usuario, marcar como 'anon'
      userName: user ? user.displayName : 'Anónimo',  // Si no hay usuario, marcar como 'Anónimo'
      gridSize: gridSize  // Guardar el tamaño de la cuadrícula
    });

    // Después de guardar, obtener los top récords del mismo tamaño de cuadrícula
    return await fetchHighScores(gridSize);
  } catch (error) {
    console.error('Error guardando el score en Firestore: ', error);
    return [];
  }
};

export const fetchHighScores = async (gridSize) => {
  try {
    const q = query(
      collection(db, 'records'),
      where('gridSize', '==', gridSize),  // Filtrar por tamaño de cuadrícula
      orderBy('score', 'desc'),  // Ordenar por puntuación de mayor a menor
      limit(20)  // Limitar a los 20 mejores
    );
    const querySnapshot = await getDocs(q);

    // Devolver los resultados de la consulta
    return querySnapshot.docs.map(doc => ({
      score: doc.data().score,
      gridSize: doc.data().gridSize,
      date: doc.data().timestamp.toDate(),  // Convertir a fecha nativa de JS
      userName: doc.data().userName
    }));
  } catch (error) {
    console.error('Error obteniendo los scores de Firestore: ', error);
    return [];
  }
};
