import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { saveHighScore } from '../../components/scoreService';

const windowWidth = Dimensions.get('window').width;
const isMobile = Platform.OS !== 'web' || windowWidth < 800;

const BUTTON_SIZE = Math.floor(windowWidth / 5);

enum Direction {
  Up,
  Down,
  Left,
  Right,
}

const generateFoodPosition = (gridSize: number, snake: { x: number; y: number }[]): { x: number; y: number } => {
  let newPosition: { x: number; y: number };
  do {
    newPosition = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (snake.some(segment => segment.x === newPosition.x && segment.y === newPosition.y));
  return newPosition;
};

export default function SnakeGame() {
  const [gridSize, setGridSize] = useState(15);
  const CELL_SIZE = Math.floor(windowWidth / gridSize);

  const getInitialSnakePosition = () => [{ x: 0, y: Math.floor(gridSize / 2) }];

  const [snake, setSnake] = useState(getInitialSnakePosition());
  const [food, setFood] = useState(generateFoodPosition(gridSize, snake));
  const [direction, setDirection] = useState<Direction>(Direction.Right);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [recordSaved, setRecordSaved] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(moveSnake, 200);
      return () => clearInterval(interval);
    }
  }, [snake, direction, gameStarted]);

  useEffect(() => {
    if (isGameOver && !recordSaved) {
      saveHighScore(score, null, gridSize).then(() => {
        console.log('Puntuaciones actualizadas');
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
      setGameStarted(false);
      return;
    }

    const newSnake = [head, ...snake];
    if (head.x === food.x && head.y === food.y) {
      setFood(generateFoodPosition(gridSize, newSnake));
      setScore(score + 1);
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
  };

  const checkCollision = (head: { x: number; y: number }) => {
    return (
      head.x < 0 ||
      head.x >= gridSize ||
      head.y < 0 ||
      head.y >= gridSize ||
      snake.some(segment => segment.x === head.x && segment.y === head.y)
    );
  };

  const resetGame = () => {
    const initialSnakePosition = getInitialSnakePosition();
    setSnake(initialSnakePosition);
    setFood(generateFoodPosition(gridSize, initialSnakePosition));
    setDirection(Direction.Right);
    setIsGameOver(false);
    setScore(0);
    setRecordSaved(false);
    setGameStarted(false);
  };

  const changeGridSize = (newSize: number) => {
    setGridSize(newSize);
    resetGame();
  };

  const startGame = () => {
    resetGame();
    setGameStarted(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.centeredContainer}>
        {/* Mostrar el juego solo cuando esté en progreso */}
        {gameStarted && !isGameOver && (
          <>
            <Text style={styles.scoreText}>Score: {score}</Text>
            <View style={[styles.grid, { width: gridSize * CELL_SIZE, height: gridSize * CELL_SIZE }]}>
              {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                const x = index % gridSize;
                const y = Math.floor(index / gridSize);
                const isSnake = snake.some(segment => segment.x === x && segment.y === y);
                const isFood = food.x === x && food.y === y;
                return (
                  <View
                    key={index}
                    style={[
                      styles.cell,
                      { width: CELL_SIZE, height: CELL_SIZE },
                      isSnake && styles.snake,
                      isFood && styles.food,
                    ]}
                  />
                );
              })}
            </View>

            {/* Mostrar botones de control de la serpiente solo cuando el juego está en progreso */}
            <View style={styles.controls}>
              <View style={styles.controlRow}>
                <View style={styles.emptySpace} />
                <TouchableOpacity onPress={() => setDirection(Direction.Up)} style={styles.controlButton}>
                  <Icon name="arrow-up" size={30} color="white" />
                </TouchableOpacity>
                <View style={styles.emptySpace} />
              </View>
              <View style={styles.controlRow}>
                <TouchableOpacity onPress={() => setDirection(Direction.Left)} style={styles.controlButton}>
                  <Icon name="arrow-left" size={30} color="white" />
                </TouchableOpacity>
                <View style={styles.emptySpace} />
                <TouchableOpacity onPress={() => setDirection(Direction.Right)} style={styles.controlButton}>
                  <Icon name="arrow-right" size={30} color="white" />
                </TouchableOpacity>
              </View>
              <View style={styles.controlRow}>
                <View style={styles.emptySpace} />
                <TouchableOpacity onPress={() => setDirection(Direction.Down)} style={styles.controlButton}>
                  <Icon name="arrow-down" size={30} color="white" />
                </TouchableOpacity>
                <View style={styles.emptySpace} />
              </View>
            </View>
          </>
        )}

        {/* Mostrar pantalla de Game Over o Start */}
        {(!gameStarted || isGameOver) && (
          <>
            <Text style={styles.gameOverText}>
              {isGameOver ? "Game Over" : "Snake Game"}
            </Text>
            <Text style={styles.scoreText}>Score: {score}</Text>
          </>
        )}
      </View>

      {/* Mostrar controles solo cuando el juego no haya comenzado o esté en Game Over */}
      {(!gameStarted || isGameOver) && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity onPress={startGame} style={styles.button}>
            <Text style={styles.buttonText}>Start Game</Text>
          </TouchableOpacity>
          <View style={styles.gridSizeSelector}>
            <TouchableOpacity
              onPress={() => changeGridSize(gridSize - 3)}
              style={[
                styles.iconWrapper,
                gridSize <= 6 && styles.hiddenIcon,
              ]}
            >
              <Icon name="caret-left" size={30} color="white" />
            </TouchableOpacity>
            <Text style={styles.gridSizeText}>{gridSize} x {gridSize}</Text>
            <TouchableOpacity
              onPress={() => changeGridSize(gridSize + 3)}
              style={[
                styles.iconWrapper,
                gridSize >= 15 && styles.hiddenIcon,
              ]}
            >
              <Icon name="caret-right" size={30} color="white" />
            </TouchableOpacity>
          </View>
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
    justifyContent: 'space-between',
  },
  centeredContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#333',
  },
  cell: {
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
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
  },
  controls: {
    marginTop: 10,
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    marginTop: 5,
  },
  controlButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    backgroundColor: '#888',
    borderRadius: 5,
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySpace: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  gridSizeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  gridSizeText: {
    fontSize: 24,
    color: 'white',
    marginHorizontal: 20,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#888',
    marginHorizontal: 10,
  },
  hiddenIcon: {
    opacity: 0,
  },
});
