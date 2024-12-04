import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { fetchHighScores } from '../../components/scoreService';
import { fetchAIRecords } from '../../components/scoreAIService';

interface HighScore {
  score: number;
  date: Date;
  userName: string;
}

interface AIRecord {
  playerScore: number;
  aiScore: number;
  date: Date;
  userName: string;
}

export default function ExploreScreen() {
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [aiRecords, setAIRecords] = useState<AIRecord[]>([]);
  const [aiReviveRecords, setAIReviveRecords] = useState<AIRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridSize, setGridSize] = useState(15);
  const [showAIRecords, setShowAIRecords] = useState(false);
  const [showAIReviveRecords, setShowAIReviveRecords] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const loadScores = async () => {
        try {
          setLoading(true);

          if (gridSize === 15 && showAIRecords) {
            const records = await fetchAIRecords(1); // Records vs IA
            setAIRecords(records);
          } else if (gridSize === 15 && showAIReviveRecords) {
            const reviveRecords = await fetchAIRecords(2); // Records IA revive
            setAIReviveRecords(reviveRecords);
          } else {
            const scores = await fetchHighScores(gridSize);
            setHighScores(scores);
          }
        } catch (error) {
          console.error('Error cargando los scores:', error);
        } finally {
          setLoading(false);
        }
      };

      loadScores();
    }, [gridSize, showAIRecords, showAIReviveRecords])
  );

  const changeGridSize = (direction: 'left' | 'right') => {
    if (gridSize === 15 && direction === 'right') {
      if (showAIRecords) {
        setShowAIRecords(false);
        setShowAIReviveRecords(true);
      } else {
        setShowAIRecords(true);
        setShowAIReviveRecords(false);
      }
    } else if ((showAIRecords || showAIReviveRecords) && direction === 'left') {
      if (showAIReviveRecords) {
        setShowAIReviveRecords(false);
        setShowAIRecords(true);
      } else {
        setShowAIRecords(false);
      }
    } else {
      setGridSize((prevSize) => {
        if (direction === 'left') return Math.max(prevSize - 3, 6);
        if (direction === 'right') return Math.min(prevSize + 3, 15);
        return prevSize;
      });
    }
  };

  const formatDate = (date: Date) => date.toLocaleDateString();

  const truncateName = (name: string) => name.split(' ')[0];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.scoresContainer}>
        {gridSize === 15 && showAIReviveRecords ? (
          <>
            <Text style={styles.subtitle}>Records IA Revive</Text>
            {aiReviveRecords.map((record, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.cell}>{index + 1}º</Text>
                <Text style={styles.cell}>{truncateName(record.userName || 'Anónimo')}</Text>
                <Text style={styles.cell}>{record.playerScore}</Text>
                <Text style={styles.cell}>{record.aiScore}</Text>
                <Text style={styles.cell}>{formatDate(record.date)}</Text>
              </View>
            ))}
          </>
        ) : gridSize === 15 && showAIRecords ? (
          <>
            <Text style={styles.subtitle}>Top Records vs IA</Text>
            {aiRecords.map((record, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.cell}>{index + 1}º</Text>
                <Text style={styles.cell}>{truncateName(record.userName || 'Anónimo')}</Text>
                <Text style={styles.cell}>{record.playerScore}</Text>
                <Text style={styles.cell}>{record.aiScore}</Text>
                <Text style={styles.cell}>{formatDate(record.date)}</Text>
              </View>
            ))}
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>Top Scores for {gridSize} x {gridSize}:</Text>
            {highScores.map((highScore, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.cell}>{index + 1}º</Text>
                <Text style={styles.cell}>{truncateName(highScore.userName || 'Anónimo')}</Text>
                <Text style={styles.cell}>{highScore.score}</Text>
                <Text style={styles.cell}>{formatDate(highScore.date)}</Text>
              </View>
            ))}
          </>
        )}
      </View>
      <View style={styles.gridSizeSelector}>
        <TouchableOpacity
          onPress={() => changeGridSize('left')}
          style={[styles.iconWrapper, gridSize <= 6 && !showAIRecords && !showAIReviveRecords && styles.hiddenIcon]}
        >
          <Icon name="caret-left" size={30} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.gridSizeText}>
          {gridSize === 15 && showAIReviveRecords
            ? 'Records IA Revive'
            : gridSize === 15 && showAIRecords
            ? 'Records vs IA'
            : `${gridSize} x ${gridSize}`}
        </Text>
        <TouchableOpacity
          onPress={() => changeGridSize('right')}
          style={[
            styles.iconWrapper,
            gridSize === 15 && showAIReviveRecords && styles.hiddenIcon,
          ]}
        >
          <Icon name="caret-right" size={30} color="#FFD700" />
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
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFD700',
  },
  scoresContainer: {
    width: '90%',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 30,
    textAlign: 'center',
    color: '#FFD700',
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
    color: '#FFD700',
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
    fontSize: 13,
    color: '#FFD700',
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333333',
    marginHorizontal: 10,
  },
  hiddenIcon: {
    opacity: 0,
  },
});
