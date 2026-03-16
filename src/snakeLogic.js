export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = "right";
export const TICK_MS = 140;

export const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE_DIRECTIONS = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

function samePosition(a, b) {
  return a.x === b.x && a.y === b.y;
}

function normalizeDirection(currentDirection, requestedDirection) {
  if (!requestedDirection) {
    return currentDirection;
  }

  if (OPPOSITE_DIRECTIONS[currentDirection] === requestedDirection) {
    return currentDirection;
  }

  return requestedDirection;
}

export function createInitialSnake(gridSize = GRID_SIZE) {
  const center = Math.floor(gridSize / 2);

  return [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];
}

export function listOpenCells(snake, gridSize = GRID_SIZE) {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const openCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        openCells.push({ x, y });
      }
    }
  }

  return openCells;
}

export function placeFood(snake, gridSize = GRID_SIZE, random = Math.random) {
  const openCells = listOpenCells(snake, gridSize);

  if (openCells.length === 0) {
    return null;
  }

  const index = Math.floor(random() * openCells.length);
  return openCells[index];
}

export function createInitialState(random = Math.random, gridSize = GRID_SIZE) {
  const snake = createInitialSnake(gridSize);

  return {
    gridSize,
    snake,
    direction: INITIAL_DIRECTION,
    queuedDirection: INITIAL_DIRECTION,
    food: placeFood(snake, gridSize, random),
    score: 0,
    isGameOver: false,
    isPaused: false,
    hasStarted: false,
  };
}

export function queueDirection(state, requestedDirection) {
  return {
    ...state,
    queuedDirection: normalizeDirection(state.direction, requestedDirection),
  };
}

export function togglePause(state) {
  if (state.isGameOver || !state.hasStarted) {
    return state;
  }

  return {
    ...state,
    isPaused: !state.isPaused,
  };
}

export function stepGame(state, random = Math.random) {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const direction = normalizeDirection(state.direction, state.queuedDirection);
  const vector = DIRECTION_VECTORS[direction];
  const head = state.snake[0];
  const nextHead = {
    x: head.x + vector.x,
    y: head.y + vector.y,
  };

  const hitsWall =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= state.gridSize ||
    nextHead.y >= state.gridSize;

  if (hitsWall) {
    return {
      ...state,
      direction,
      isGameOver: true,
      hasStarted: true,
    };
  }

  const ateFood = state.food && samePosition(nextHead, state.food);
  const bodyToCheck = ateFood ? state.snake : state.snake.slice(0, -1);
  const hitsSelf = bodyToCheck.some((segment) => samePosition(segment, nextHead));

  if (hitsSelf) {
    return {
      ...state,
      direction,
      isGameOver: true,
      hasStarted: true,
    };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!ateFood) {
    nextSnake.pop();
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    queuedDirection: direction,
    food: ateFood ? placeFood(nextSnake, state.gridSize, random) : state.food,
    score: ateFood ? state.score + 1 : state.score,
    hasStarted: true,
  };
}
