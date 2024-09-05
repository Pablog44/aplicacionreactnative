import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { fetchHighScores } from '../../components/scoreService';

interface HighScore {
  score: number;
  date: Date;
  userName: string;
}

export default function ExploreScreen() {
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridSize, setGridSize] = useState(15);

  useFocusEffect(
    React.useCallback(() => {
      const loadHighScores = async () => {
        try {
          setLoading(true);
          const scores = await fetchHighScores(gridSize);
          setHighScores(scores);
        } catch (error) {
          console.error('Error cargando los scores:', error);
        } finally {
          setLoading(false);
        }
      };

      loadHighScores();
    }, [gridSize])
  );

  const changeGridSize = (direction: 'left' | 'right') => {
    setGridSize((prevSize) => {
      if (direction === 'left') return Math.max(prevSize - 3, 6);
      if (direction === 'right') return Math.min(prevSize + 3, 15);
      return prevSize;
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const truncateName = (name: string) => {
    return name.split(' ')[0]; // Toma solo la primera palabra del nombre
  };

  return (
    <View style={styles.container}>
      <View style={styles.scoresContainer}>
        <Text style={styles.subtitle}>Top Scores for {gridSize} x {gridSize}:</Text>
        {highScores.map((highScore, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.cell}>{index + 1}º</Text>
            <Text style={styles.cell}>{truncateName(highScore.userName || 'Anónimo')}</Text>
            <Text style={styles.cell}>{highScore.score}</Text>
            <Text style={styles.cell}>{formatDate(highScore.date)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.gridSizeSelector}>
        <TouchableOpacity
          onPress={() => changeGridSize('left')}
          style={[
            styles.iconWrapper,
            gridSize <= 6 && styles.hiddenIcon,
          ]}
        >
          <Icon name="caret-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.gridSizeText}>{gridSize} x {gridSize}</Text>
        <TouchableOpacity
          onPress={() => changeGridSize('right')}
          style={[
            styles.iconWrapper,
            gridSize >= 15 && styles.hiddenIcon,
          ]}
        >
          <Icon name="caret-right" size={30} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  scoresContainer: {
    width: '100%',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 30,
    textAlign: 'center',
  },
  gridSizeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  gridSizeText: {
    fontSize: 24,
    marginHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 5,
    
  },
  cell: {
    width: '25%',
    textAlign: 'center',
    fontSize: 16,
    
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b6b6b6',
    marginHorizontal: 10,
  },
  hiddenIcon: {
    opacity: 0,
  },
});
