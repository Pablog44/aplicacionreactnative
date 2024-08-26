import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchHighScores } from '../../components/scoreService';

interface HighScore {
  score: number;
  date: Date;
}

export default function ExploreScreen() {
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [loading, setLoading] = useState(true); // Nuevo estado para manejar el estado de carga

  useFocusEffect(
    React.useCallback(() => {
      const loadHighScores = async () => {
        try {
          setLoading(true); // Iniciar la carga
          const scores = await fetchHighScores();
          setHighScores(scores);
        } catch (error) {
          console.error('Error cargando los scores:', error);
        } finally {
          setLoading(false); // Finalizar la carga
        }
      };

      loadHighScores();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(); // Formateamos la fecha para mostrarla
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Top Scores:</Text>
      <View style={styles.scoresContainer}>
        {highScores.map((highScore, index) => (
          <Text key={index} style={styles.scoreText}>
            {index + 1}: {highScore.score} - {formatDate(highScore.date)}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  scoresContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  scoreText: {
    fontSize: 18,
    marginBottom: 10,
  },
});
