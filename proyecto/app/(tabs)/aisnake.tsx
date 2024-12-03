import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Vibration } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { saveHighScore } from '../../components/scoreService';
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';

const windowWidth = Dimensions.get('window').width;
const isMobile = Platform.OS !== 'web' || windowWidth < 800;
const BUTTON_SIZE = Math.floor(windowWidth / 5);

enum Direction {
  Up,
  Down,
  Left,
  Right,
}

interface Position {
  x: number;
  y: number;
}

const generateFoodPosition = (
  gridSize: number,
  snakes: Position[][]
): Position => {
  let newPosition: Position;
  do {
    newPosition = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (snakes.some(snake => snake.some(segment => segment.x === newPosition.x && segment.y === newPosition.y)));
  return newPosition;
};

const checkCollision = (
  head: Position,
  obstacles: Position[],
  gridSize: number
): boolean => {
  return (
    head.x < 0 ||
    head.x >= gridSize ||
    head.y < 0 ||
    head.y >= gridSize ||
    obstacles.some(segment => segment.x === head.x && segment.y === head.y)
  );
};

const chooseBestMove = (
  moves: { x: number; y: number; direction: Direction }[],
  target: Position
): { x: number; y: number; direction: Direction } | null => {
  if (moves.length === 0) return null;

  moves.sort((a, b) => {
    const distA = Math.abs(a.x - target.x) + Math.abs(a.y - target.y);
    const distB = Math.abs(b.x - target.x) + Math.abs(b.y - target.y);
    return distA - distB;
  });

  return moves[0];
};

export default function SnakeGame() {
  const [gridSize, setGridSize] = useState(15);
  const CELL_SIZE = Math.floor(windowWidth / gridSize);

  const getInitialSnakePosition = (): Position[] => [{ x: 0, y: Math.floor(gridSize / 2) }];
  const getInitialAISnakePosition = (): Position[] => [{ x: gridSize - 1, y: Math.floor(gridSize / 2) }];

  const [snake, setSnake] = useState<Position[]>(getInitialSnakePosition());
  const [aiSnake, setAISnake] = useState<Position[] | null>(getInitialAISnakePosition());
  const [food, setFood] = useState<Position>(generateFoodPosition(gridSize, [snake, aiSnake || []]));
  const [direction, setDirection] = useState<Direction>(Direction.Right);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (gameStarted && !isGameOver) {
      const interval = setInterval(() => {
        moveSnake();
        if (aiSnake) moveAISnake();
      }, 200);
      return () => clearInterval(interval);
    }
  }, [snake, aiSnake, direction, gameStarted]);

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

    if (checkCollision(head, [...(aiSnake || []), ...snake.slice(1)], gridSize)) {
      setIsGameOver(true);
      setGameStarted(false);
      return;
    }

    const newSnake = [head, ...snake];
    if (head.x === food.x && head.y === food.y) {
      setFood(generateFoodPosition(gridSize, [newSnake, aiSnake || []]));
      setScore(score + 1);
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
  };

  const moveAISnake = () => {
    if (isGameOver || !aiSnake) return;

    const aiHead = { ...aiSnake[0] };
    const possibleMoves = [
      { x: aiHead.x, y: aiHead.y - 1, direction: Direction.Up },
      { x: aiHead.x, y: aiHead.y + 1, direction: Direction.Down },
      { x: aiHead.x - 1, y: aiHead.y, direction: Direction.Left },
      { x: aiHead.x + 1, y: aiHead.y, direction: Direction.Right },
    ].filter(move => !checkCollision(move, [...snake, ...aiSnake], gridSize));

    const bestMove = chooseBestMove(possibleMoves, food);

    if (!bestMove) {
      setAISnake(null);
      return;
    }

    aiHead.x = bestMove.x;
    aiHead.y = bestMove.y;

    if (checkCollision(aiHead, snake, gridSize)) {
      setAISnake(null);
      return;
    }

    const newAISnake = [aiHead, ...aiSnake];
    if (aiHead.x === food.x && aiHead.y === food.y) {
      setFood(generateFoodPosition(gridSize, [snake, newAISnake]));
    } else {
      newAISnake.pop();
    }
    setAISnake(newAISnake);
  };

  const resetGame = () => {
    setSnake(getInitialSnakePosition());
    setAISnake(getInitialAISnakePosition());
    setFood(generateFoodPosition(gridSize, [getInitialSnakePosition(), getInitialAISnakePosition()]));
    setDirection(Direction.Right);
    setIsGameOver(false);
    setScore(0);
    setGameStarted(false);
  };

  const startGame = () => {
    resetGame();
    setGameStarted(true);
  };

  const handleControlPress = (newDirection: Direction) => {
    if (
      (newDirection === Direction.Up && direction === Direction.Down) ||
      (newDirection === Direction.Down && direction === Direction.Up) ||
      (newDirection === Direction.Left && direction === Direction.Right) ||
      (newDirection === Direction.Right && direction === Direction.Left)
    ) {
      return; // Previene movimientos opuestos
    }
    Vibration.vibrate(50);
    setDirection(newDirection);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.gameOverText}>{isGameOver ? 'Game Over' : 'Snake Game'}</Text>
      <Text style={styles.scoreText}>Score: {score}</Text>
      <View style={[styles.grid, { width: gridSize * CELL_SIZE, height: gridSize * CELL_SIZE }]}>
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);
          const isSnake = snake.some(segment => segment.x === x && segment.y === y);
          const isAISnake = aiSnake?.some(segment => segment.x === x && segment.y === y);
          const isFood = food.x === x && food.y === y;
          return (
            <View
              key={index}
              style={[
                styles.cell,
                { width: CELL_SIZE, height: CELL_SIZE },
                isSnake && styles.snake,
                isAISnake && styles.aiSnake,
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
      {!gameStarted && (
        <TouchableOpacity onPress={startGame} style={styles.playButton}>
          <Icon name="play" size={30} color="#FFD700" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#333333',
  },
  cell: {
    borderWidth: 1,
    borderColor: '#222',
  },
  snake: {
    backgroundColor: '#FFD700',
  },
  aiSnake: {
    backgroundColor: '#00FF00',
  },
  food: {
    backgroundColor: '#FF5252',
  },
  playButton: {
    width: 90,
    height: 90,
    backgroundColor: '#444444',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  gameOverText: {
    fontSize: 48,
    color: '#FFD700',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 24,
    color: '#FFD700',
    marginBottom: 10,
  },
  controls: {
    marginTop: 10,
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 5,
  },
  controlButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    backgroundColor: '#444444',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  emptySpace: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
});