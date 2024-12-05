import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Vibration } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { saveHighScore } from '../../components/scoreService';
import { auth } from '../../firebaseConfig'; // Importar auth para obtener el usuario autenticado
import { onAuthStateChanged, User } from 'firebase/auth'; // Importar Firebase Auth

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

  const [user, setUser] = useState<User | null>(null); // Para manejar el estado del usuario

  useEffect(() => {
    // Suscribirse a los cambios en el estado de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Limpiar la suscripción al desmontar
  }, []);

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(moveSnake, 200);
      return () => clearInterval(interval);
    }
  }, [snake, direction, gameStarted]);

  useEffect(() => {
    if (isGameOver && !recordSaved) {
      // Guardar el high score con los detalles del usuario autenticado (si existe)
      saveHighScore(score, user, gridSize).then(() => {
        console.log('Puntuaciones actualizadas');
      });
      setRecordSaved(true);
    }
  }, [isGameOver, recordSaved, score, user]); // Asegurarse de que el usuario se pase correctamente

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
    // Limitar el tamaño de la cuadrícula entre 6 y 15
    if (newSize >= 6 && newSize <= 15) {
      setGridSize(newSize);
      resetGame();
    }
  };

  const startGame = () => {
    resetGame();
    setGameStarted(true);
  };

  // Función para manejar la vibración cuando se presiona un botón
  const handleControlPress = (newDirection: Direction) => {
    Vibration.vibrate(50); // Vibración corta de 50ms
    setDirection(newDirection);
  };

  return (
    <View style={styles.container}>
      <View style={styles.centeredContainer}>
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

            <View style={styles.controls}>
              <View style={styles.controlRow}>
                <View style={styles.emptySpace} />
                <TouchableOpacity onPress={() => handleControlPress(Direction.Up)} style={styles.controlButton}>
                  <Icon name="arrow-up" size={30} color="#FFD700" />
                </TouchableOpacity>
                <View style={styles.emptySpace} />
              </View>
              <View style={styles.controlRow}>
                <TouchableOpacity onPress={() => handleControlPress(Direction.Left)} style={styles.controlButton}>
                  <Icon name="arrow-left" size={30} color="#FFD700" />
                </TouchableOpacity>
                <View style={styles.emptySpace} />
                <TouchableOpacity onPress={() => handleControlPress(Direction.Right)} style={styles.controlButton}>
                  <Icon name="arrow-right" size={30} color="#FFD700" />
                </TouchableOpacity>
              </View>
              <View style={styles.controlRow}>
                <View style={styles.emptySpace} />
                <TouchableOpacity onPress={() => handleControlPress(Direction.Down)} style={styles.controlButton}>
                  <Icon name="arrow-down" size={30} color="#FFD700" />
                </TouchableOpacity>
                <View style={styles.emptySpace} />
              </View>
            </View>
          </>
        )}

        {(!gameStarted || isGameOver) && (
          <>
            <Text style={styles.gameOverText}>
              {isGameOver ? "Game Over" : "Juega"}
            </Text>
            <Text style={styles.scoreText}>Puntuación: {score}</Text>
          </>
        )}
      </View>

      {(!gameStarted || isGameOver) && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity onPress={startGame} style={styles.playButton}>
            <Icon name="play" size={30} color="#FFD700" />
          </TouchableOpacity>

          <View style={styles.gridSizeSelector}>
            {/* Botón para reducir el tamaño de la cuadrícula solo si es mayor que 6 */}
            <TouchableOpacity
              onPress={() => changeGridSize(gridSize - 3)}
              style={[
                styles.iconWrapper,
                gridSize <= 6 && styles.disabledIcon,
              ]}
              disabled={gridSize <= 6}
            >
              <Icon name="caret-left" size={30} color="#FFD700" />
            </TouchableOpacity>
            
            <Text style={styles.gridSizeText}>{gridSize} x {gridSize}</Text>

            {/* Botón para aumentar el tamaño de la cuadrícula solo si es menor que 15 */}
            <TouchableOpacity
              onPress={() => changeGridSize(gridSize + 3)}
              style={[
                styles.iconWrapper,
                gridSize >= 15 && styles.disabledIcon,
              ]}
              disabled={gridSize >= 15}
            >
              <Icon name="caret-right" size={30} color="#FFD700" />
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
    backgroundColor: '#121212', // Fondo oscuro
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
    marginBottom: 60,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#333333', // Fondo más oscuro para la cuadrícula
  },
  cell: {
    borderWidth: 1,
    borderColor: '#black', // Color del borde de las celdas
  },
  snake: {
    backgroundColor: '#FFD700', // color para la serpiente
  },
  food: {
    backgroundColor: '#ff5252', // Rojo brillante para la comida
  },
  gameOverText: {
    fontSize: 48,
    color: '#FFD700', // Texto dorado oscuro para "Game Over"
    marginTop: 90,
  },
  scoreText: {
    fontSize: 24,
    color: '#FFD700', // Texto dorado oscuro para el puntaje
    marginBottom: 10,
  },
  playButton: {
    width: 90, // Tamaño del botón ligeramente más grande
    height: 90,
    backgroundColor: '#444444', // Fondo oscuro para el botón "play"
    borderRadius: 45, // Hacer el botón circular
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
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
    backgroundColor: '#555555', // Fondo gris oscuro para los botones de control
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
    color: '#FFD700', // Texto dorado oscuro para el tamaño de la cuadrícula
    marginHorizontal: 20,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#555555', // Fondo gris oscuro para los íconos
    marginHorizontal: 10,
  },
  disabledIcon: {
    opacity: 0, // Reducir la opacidad cuando el botón está desactivado
  },
});
