import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Guardar el registro de la partida con IA
export const saveAIRecord = async (playerScore, aiScore, gameType, user) => {
  if (!gameType) {
    console.error('El tipo de juego (gameType) es indefinido o nulo.');
    return [];
  }

  try {
    // Agregar el registro a la colección 'recordsai'
    await addDoc(collection(db, 'recordsai'), {
      playerScore,
      aiScore,
      gameType, // Tipo de juego (1 por defecto)
      timestamp: new Date(), // Fecha y hora actuales
      userId: user ? user.uid : 'anon', // Si no hay usuario, marcar como 'anon'
      userName: user ? user.displayName : 'Anónimo', // Si no hay usuario, marcar como 'Anónimo'
    });

    // Obtener los top registros del mismo tipo de juego
    return await fetchAIRecords(gameType);
  } catch (error) {
    console.error('Error guardando el registro en Firestore: ', error);
    return [];
  }
};

// Obtener los registros de partidas con IA
export const fetchAIRecords = async (gameType) => {
  try {
    const q = query(
      collection(db, 'recordsai'),
      where('gameType', '==', gameType), // Filtrar por tipo de juego
      orderBy('playerScore', 'desc'), // Ordenar por puntuación del jugador (mayor a menor)
      limit(20) // Limitar a los 20 mejores registros
    );
    const querySnapshot = await getDocs(q);

    // Devolver los resultados de la consulta
    return querySnapshot.docs.map(doc => ({
      playerScore: doc.data().playerScore,
      aiScore: doc.data().aiScore,
      date: doc.data().timestamp.toDate(), // Convertir a fecha nativa de JS
      userName: doc.data().userName,
    }));
  } catch (error) {
    console.error('Error obteniendo los registros de Firestore: ', error);
    return [];
  }
};
