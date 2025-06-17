// JavaScript for N-Queens Game

let board = [], n = 0, moveCount = 0, queensPlaced = 0;
let moveHistory = [];

const clickSound = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_b7d2dce8bb.mp3?filename=click-2-87247.mp3");
const errorSound = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_a530d5f20f.mp3?filename=error-126627.mp3");
const successSound = new Audio("https://cdn.pixabay.com/download/audio/2022/10/21/audio_86178d1718.mp3?filename=success-1-6297.mp3");

function startGame() {
  n = parseInt(document.getElementById("sizeInput").value);
  if (isNaN(n) || n < 4 || n > 10) {
    playError();
    showPopup("Please enter a number between 4 and 10.");
    return;
  }

  board = Array.from({ length: n }, () => Array(n).fill(0));
  moveCount = 0;
  queensPlaced = 0;
  moveHistory = [];
  drawBoard();
  updateInfo();
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("solveBtn").style.display = "inline-block";
  document.getElementById("replayBtn").style.display = "inline-block";
  document.getElementById("history").style.display = "block";
  updateHistory();
}

function drawBoard() {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";
  boardDiv.style.gridTemplateColumns = `repeat(${n}, 60px)`;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const cell = document.createElement("div");
      cell.className = `cell ${(i + j) % 2 === 0 ? 'white' : 'black'}`;
      cell.textContent = board[i][j] === 1 ? "\u265B" : "";
      cell.onclick = () => handleCellClick(i, j);
      boardDiv.appendChild(cell);
    }
  }
}

function handleCellClick(row, col) {
  if (board[row][col] === 1) {
    board[row][col] = 0;
    queensPlaced--;
    moveHistory.push({ action: "Removed", row, col });
    playClick();
  } else {
    if (isSafe(row, col)) {
      board[row][col] = 1;
      queensPlaced++;
      moveHistory.push({ action: "Placed", row, col });
      playClick();
    } else {
      playError();
      showPopup("Invalid move! Queens are attacking each other.");
      moveCount++;
      updateInfo();
      return;
    }
  }
  moveCount++;
  drawBoard();
  updateInfo();
  updateHistory();

  if (queensPlaced === n && isSolved()) {
    playSuccess();
    showPopup(`\u{1F389} Solved in ${moveCount} moves! Resetting...`);
    setTimeout(() => resetToStart(), 3000);
  }
}

function updateHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  moveHistory.forEach((m, i) => {
    const entry = document.createElement("div");
    entry.className = "move";
    entry.textContent = `${i + 1}. ${m.action} at (${m.row + 1}, ${m.col + 1})`;
    list.appendChild(entry);
  });
}

function replayGame() {
  board = Array.from({ length: n }, () => Array(n).fill(0));
  drawBoard();
  let step = 0;
  const interval = setInterval(() => {
    if (step >= moveHistory.length) {
      clearInterval(interval);
      return;
    }
    const move = moveHistory[step];
    if (move.action === "Placed") board[move.row][move.col] = 1;
    else board[move.row][move.col] = 0;
    drawBoard();
    step++;
  }, 500);
}

function isSafe(r, c) {
  for (let i = 0; i < n; i++) {
    if (board[r][i] === 1 || board[i][c] === 1) return false;
  }
  for (let i = -n; i <= n; i++) {
    if (isValid(r + i, c + i) && board[r + i][c + i] === 1) return false;
    if (isValid(r + i, c - i) && board[r + i][c - i] === 1) return false;
  }
  return true;
}

function isSafeStrict(r, c) {
  for (let i = 0; i < n; i++) {
    if (i !== c && board[r][i] === 1) return false;
    if (i !== r && board[i][c] === 1) return false;
  }
  for (let i = -n; i <= n; i++) {
    if (isValid(r + i, c + i) && i !== 0 && board[r + i][c + i] === 1) return false;
    if (isValid(r + i, c - i) && i !== 0 && board[r + i][c - i] === 1) return false;
  }
  return true;
}

function isSolved() {
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (board[r][c] === 1 && !isSafeStrict(r, c)) return false;
    }
  }
  return true;
}

function isValid(i, j) {
  return i >= 0 && j >= 0 && i < n && j < n;
}

function updateInfo() {
  document.getElementById("info").innerText = 
    `Moves: ${moveCount} | Queens placed: ${queensPlaced}/${n}`;
}

function solveAutomatically() {
  const tempBoard = Array.from({ length: n }, () => Array(n).fill(0));
  if (solveNQueens(tempBoard, 0)) {
    board = tempBoard;
    drawBoard();
    queensPlaced = n;
    moveCount++;
    updateInfo();
    playSuccess();
    showPopup("\u2705 Solved automatically! Resetting...");
    setTimeout(() => resetToStart(), 3000);
  } else {
    playError();
    showPopup("\u274C No solution exists.");
  }
}

function solveNQueens(tempBoard, col) {
  if (col >= n) return true;
  for (let i = 0; i < n; i++) {
    if (isSafeAuto(tempBoard, i, col)) {
      tempBoard[i][col] = 1;
      if (solveNQueens(tempBoard, col + 1)) return true;
      tempBoard[i][col] = 0;
    }
  }
  return false;
}

function isSafeAuto(b, row, col) {
  for (let i = 0; i < col; i++)
    if (b[row][i] === 1) return false;
  for (let i = row, j = col; i >= 0 && j >= 0; i--, j--)
    if (b[i][j] === 1) return false;
  for (let i = row, j = col; i < n && j >= 0; i++, j--)
    if (b[i][j] === 1) return false;
  return true;
}

function showPopup(message) {
  const popup = document.getElementById("popup");
  popup.textContent = message;
  popup.style.display = "block";
  setTimeout(() => popup.style.display = "none", 3000);
}

function resetToStart() {
  document.getElementById("startScreen").style.display = "block";
  document.getElementById("solveBtn").style.display = "none";
  document.getElementById("replayBtn").style.display = "none";
  document.getElementById("board").innerHTML = "";
  document.getElementById("info").innerText = "";
  document.getElementById("sizeInput").value = "";
  document.getElementById("history").style.display = "none";
}

function playClick() {
  clickSound.currentTime = 0;
  clickSound.play();
}

function playError() {
  errorSound.currentTime = 0;
  errorSound.play();
}

function playSuccess() {
  successSound.currentTime = 0;
  successSound.play();
}
