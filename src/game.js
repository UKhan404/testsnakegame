import {
  GRID_SIZE,
  TICK_MS,
  createInitialState,
  queueDirection,
  stepGame,
  togglePause,
} from "./snakeLogic.js";

const board = document.querySelector("#board");
const scoreValue = document.querySelector("#score");
const statusText = document.querySelector("#status");
const restartButton = document.querySelector("#restart");
const controlButtons = document.querySelectorAll(".control-button");

const cells = [];
let state = createInitialState();

function createBoard() {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < GRID_SIZE * GRID_SIZE; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("role", "gridcell");
    fragment.appendChild(cell);
    cells.push(cell);
  }

  board.appendChild(fragment);
}

function getCellIndex(position) {
  return position.y * GRID_SIZE + position.x;
}

function render() {
  for (const cell of cells) {
    cell.className = "cell";
  }

  if (state.food) {
    cells[getCellIndex(state.food)].classList.add("cell--food");
  }

  state.snake.forEach((segment, index) => {
    const cell = cells[getCellIndex(segment)];
    cell.classList.add(index === 0 ? "cell--head" : "cell--snake");
  });

  scoreValue.textContent = String(state.score);

  if (state.isGameOver) {
    statusText.textContent = "Game over. Press Restart to play again.";
    return;
  }

  if (state.isPaused) {
    statusText.textContent = "Paused. Press Space, P, or Pause to resume.";
    return;
  }

  if (!state.hasStarted) {
    statusText.textContent = "Use arrow keys or WASD to start.";
    return;
  }

  statusText.textContent = "Collect food and avoid walls or yourself.";
}

function tick() {
  state = stepGame(state);
  render();
}

function restart() {
  state = createInitialState();
  render();
}

function setDirection(direction) {
  state = queueDirection(state, direction);
  render();
}

function handlePause() {
  state = togglePause(state);
  render();
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();
  const directionMap = {
    arrowup: "up",
    w: "up",
    arrowdown: "down",
    s: "down",
    arrowleft: "left",
    a: "left",
    arrowright: "right",
    d: "right",
  };

  if (key in directionMap) {
    event.preventDefault();
    setDirection(directionMap[key]);
    return;
  }

  if (key === " " || key === "p") {
    event.preventDefault();
    handlePause();
  }
}

createBoard();
render();

window.addEventListener("keydown", handleKeydown);
restartButton.addEventListener("click", restart);

controlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const { direction, action } = button.dataset;

    if (direction) {
      setDirection(direction);
      return;
    }

    if (action === "pause") {
      handlePause();
    }
  });
});

window.setInterval(tick, TICK_MS);
