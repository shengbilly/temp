const boardSize = 4;
let board = [];
let score = 0;
let bestScore = Number(localStorage.getItem("2048-best") || 0);
let gameWon = false;
let gameOver = false;

const boardElement = document.getElementById("board");
const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const messageElement = document.getElementById("message");
const restartButton = document.getElementById("restart");
const mergeSound = new Audio("merge.mp3");
mergeSound.preload = "auto";

function initGame() {
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
  score = 0;
  gameWon = false;
  gameOver = false;
  messageElement.classList.add("hidden");
  updateScores();
  placeRandomTile();
  placeRandomTile();
  renderBoard();
}

function placeRandomTile() {
  const emptyCells = [];

  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === 0) {
        emptyCells.push([rowIndex, colIndex]);
      }
    });
  });

  if (emptyCells.length === 0) {
    return;
  }

  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  board[row][col] = Math.random() < 0.9 ? 2 : 4;
}

function updateScores() {
  scoreElement.textContent = score;

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("2048-best", bestScore);
  }

  bestElement.textContent = bestScore;
}

function getTileImage(value) {
  if (value <= 0) {
    return "";
  }

  const level = Math.round(Math.log2(value));
  const imageIndex = Math.min(11, Math.max(1, level));
  return `images/level${imageIndex}.png`;
}

function renderBoard() {
  boardElement.innerHTML = "";

  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < boardSize; col += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.style.gridRow = `${row + 1}`;
      cell.style.gridColumn = `${col + 1}`;
      boardElement.appendChild(cell);
    }
  }

  board.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value === 0) {
        return;
      }

      const tile = document.createElement("div");
      tile.className = `tile tile-${value}`;
      tile.style.gridRow = `${rowIndex + 1}`;
      tile.style.gridColumn = `${colIndex + 1}`;

      const image = document.createElement("img");
      image.src = getTileImage(value);
      image.alt = String(value);
      image.style.width = "100%";
      image.style.height = "100%";
      image.style.objectFit = "contain";
      image.style.display = "block";

      tile.appendChild(image);
      boardElement.appendChild(tile);
    });
  });
}

function slideLine(line) {
  const filtered = line.filter((value) => value !== 0);
  const merged = [];
  let mergedThisLine = false;

  for (let i = 0; i < filtered.length; i += 1) {
    const current = filtered[i];
    const next = filtered[i + 1];

    if (current === next) {
      const sum = current * 2;
      merged.push(sum);
      score += sum;
      mergedThisLine = true;

      if (sum === 2048) {
        gameWon = true;
      }

      i += 1;
    } else {
      merged.push(current);
    }
  }

  if (mergedThisLine) {
    mergeSound.currentTime = 0;
    mergeSound.play().catch(() => {});
  }

  while (merged.length < boardSize) {
    merged.push(0);
  }

  return merged;
}

function move(direction) {
  if (gameWon || gameOver) {
    return;
  }

  let moved = false;
  const nextBoard = board.map((row) => [...row]);

  if (direction === "left" || direction === "right") {
    for (let row = 0; row < boardSize; row += 1) {
      const line = board[row];
      const transformed = direction === "left" ? line : [...line].reverse();
      const result = slideLine(transformed);
      const finalLine = direction === "left" ? result : result.reverse();

      for (let col = 0; col < boardSize; col += 1) {
        if (nextBoard[row][col] !== finalLine[col]) {
          moved = true;
        }
        nextBoard[row][col] = finalLine[col];
      }
    }
  } else {
    for (let col = 0; col < boardSize; col += 1) {
      const line = board.map((row) => row[col]);
      const transformed = direction === "up" ? line : [...line].reverse();
      const result = slideLine(transformed);
      const finalLine = direction === "up" ? result : result.reverse();

      for (let row = 0; row < boardSize; row += 1) {
        if (nextBoard[row][col] !== finalLine[row]) {
          moved = true;
        }
        nextBoard[row][col] = finalLine[row];
      }
    }
  }

  if (!moved) {
    return;
  }

  board = nextBoard;
  placeRandomTile();
  updateScores();
  renderBoard();
  checkGameStatus();
}

function canMove() {
  for (let row = 0; row < boardSize; row += 1) {
    for (let col = 0; col < boardSize; col += 1) {
      if (board[row][col] === 0) {
        return true;
      }

      const right = board[row][col + 1];
      const down = board[row + 1]?.[col];

      if (right === board[row][col] || down === board[row][col]) {
        return true;
      }
    }
  }

  return false;
}

function checkGameStatus() {
  if (gameWon) {
    messageElement.textContent = "你贏了！";
    messageElement.classList.remove("hidden");
    return;
  }

  if (!canMove()) {
    gameOver = true;
    messageElement.textContent = "遊戲結束！";
    messageElement.classList.remove("hidden");
  }
}

window.addEventListener("keydown", (event) => {
  const keyToDirection = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down"
  };

  const direction = keyToDirection[event.key];

  if (!direction) {
    return;
  }

  event.preventDefault();
  move(direction);
});

restartButton.addEventListener("click", initGame);

initGame();
