import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { saveHighScore } from '../../components/scoreService';
import Iniciar from './iniciar'; // Importa el nuevo componente

const windowWidth = Dimensions.get('window').width;
const isMobile = Platform.OS !== 'web' || windowWidth < 800;
const GRID_SIZE = 15;
const CELL_SIZE = isMobile ? Math.floor(windowWidth / GRID_SIZE) : Math.min(30, Math.floor(windowWidth / GRID_SIZE));
const INITIAL_SNAKE = [{ x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) }];
const INITIAL_FOOD = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };

/**
 * Elimina la dependencia de onGameOver y maneja los puntajes internamente.
 */

enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>(Direction.Right);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [recordSaved, setRecordSaved] = useState(false);

  useEffect(() => {
    const interval = setInterval(moveSnake, 200);
    return () => clearInterval(interval);
  }, [snake, direction]);

  useEffect(() => {
    if (isGameOver && !recordSaved) {
      saveHighScore(score).then((updatedScores) => {
        // Puedes hacer algo aquí con updatedScores si es necesario
        console.log('Puntuaciones actualizadas:', updatedScores);
      });
      setRecordSaved(true);
    }
  }, [isGameOver, recordSaved, score]);

  useEffect(() => {
    if (isGameOver) return;

    if (Platform.OS === 'web') {
      const handleKeyPress = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowUp':
            if (direction !== Direction.Down) setDirection(Direction.Up);
            break;
          case 'ArrowDown':
            if (direction !== Direction.Up) setDirection(Direction.Down);
            break;
          case 'ArrowLeft':
            if (direction !== Direction.Right) setDirection(Direction.Left);
            break;
          case 'ArrowRight':
            if (direction !== Direction.Left) setDirection(Direction.Right);
            break;
        }
      };

      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [direction, isGameOver]);

  const moveSnake = () => {
    if (isGameOver) return;

    const head = { ...snake[0] };
    switch (direction) {
      case Direction.Up:
        head.y -= 1;
        break;
      case Direction.Down:
        head.y += 1;
        break;
      case Direction.Left:
        head.x -= 1;
        break;
      case Direction.Right:
        head.x += 1;
        break;
    }

    if (checkCollision(head)) {
      setIsGameOver(true);
      return;
    }

    const newSnake = [head, ...snake];
    if (head.x === food.x && head.y === food.y) {
      setFood({
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      });
      setScore(score + 1);
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
  };

  const checkCollision = (head: { x: number; y: number }) => {
    return (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE ||
      snake.some(segment => segment.x === head.x && segment.y === head.y)
    );
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(Direction.Right);
    setIsGameOver(false);
    setScore(0);
    setRecordSaved(false);
  };

  if (isGameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.gameOverText}>Game Over</Text>
        <Text style={styles.scoreText}>Score: {score}</Text>
        <TouchableOpacity onPress={resetGame} style={styles.button}>
          <Text style={styles.buttonText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.scoreText}>Score: {score}</Text>


      <View style={styles.grid}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE;
          const y = Math.floor(index / GRID_SIZE);
          const isSnake = snake.some(segment => segment.x === x && segment.y === y);
          const isFood = food.x === x && food.y === y;
          return (
            <View
              key={index}
              style={[
                styles.cell,
                isSnake && styles.snake,
                isFood && styles.food,
              ]}
            />
          );
        })}
      </View>

      {Platform.OS !== 'web' && (
        <View style={styles.controls}>
          <TouchableOpacity onPress={() => setDirection(Direction.Up)} style={styles.controlButton}>
            <Text style={styles.controlText}>Up</Text>
          </TouchableOpacity>
          <View style={styles.controlRow}>
            <TouchableOpacity onPress={() => setDirection(Direction.Left)} style={styles.controlButton}>
              <Text style={styles.controlText}>Left</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDirection(Direction.Right)} style={styles.controlButton}>
              <Text style={styles.controlText}>Right</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setDirection(Direction.Down)} style={styles.controlButton}>
            <Text style={styles.controlText}>Down</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#282c34',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    width: GRID_SIZE * CELL_SIZE,
    height: GRID_SIZE * CELL_SIZE,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#333',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: '#444',
  },
  snake: {
    backgroundColor: 'green',
  },
  food: {
    backgroundColor: 'red',
  },
  gameOverText: {
    fontSize: 48,
    color: 'white',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 24,
    color: 'white',
    marginBottom: 10,
  },
  button: {
    padding: 20,
    backgroundColor: 'green',
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
  },
  welcomeText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },
  controls: {
    marginTop: 30,
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  controlButton: {
    padding: 20,
    backgroundColor: '#888',
    borderRadius: 5,
    margin: 5,
  },
  controlText: {
    fontSize: 20,
    color: 'white',
  },
});
