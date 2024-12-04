import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Guardar el registro de la partida con IA
export const saveAIRecord = async (playerScore, aiScore, gameType, user) => {
  if (gameType === undefined || gameType === null) {
    console.error('El tipo de juego (gameType) es indefinido o nulo.');
    return [];
  }

  try {
    // Agregar el registro a la colección 'recordsai'
    const recordData = {
      playerScore,
      aiScore,
      gameType, // Tipo de juego (1 por defecto)
      timestamp: new Date(), // Fecha y hora actuales
      userId: user ? user.uid : 'anon', // Si no hay usuario, marcar como 'anon'
      userName: user ? user.displayName : 'Anónimo', // Si no hay usuario, marcar como 'Anónimo'
    };

    await addDoc(collection(db, 'recordsai'), recordData);

    console.log('Registro guardado en Firestore:', recordData);

    // Obtener los mejores registros del mismo tipo de juego
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
      orderBy('playerScore', 'desc'), // Primero puntuaciones altas del jugador
      orderBy('aiScore', 'asc'), // Luego puntuaciones bajas de la IA en caso de empate
      limit(20) // Limitar a los 20 mejores registros
    );

    const querySnapshot = await getDocs(q);

    // Devolver los resultados de la consulta
    return querySnapshot.docs.map(doc => ({
      playerScore: doc.data().playerScore,
      aiScore: doc.data().aiScore,
      gameType: doc.data().gameType,
      date: doc.data().timestamp.toDate(), // Convertir a fecha nativa de JS
      userName: doc.data().userName,
    }));
  } catch (error) {
    console.error('Error obteniendo los registros de Firestore: ', error);
    return [];
  }
};
