import React, { useState, useEffect } from "react";
import "./App.css";

// Color theme constants
const COLORS = {
  primary: "#1976d2",
  accent: "#ffca28",
  secondary: "#424242",
  background: "#fff",
  border: "#e0e0e0",
  boardBg: "#f8f9fa",
  shadow: "rgba(25, 118, 210, 0.12)",
};
// Board utility: check winner
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],[3, 4, 5],[6, 7, 8],
    [0, 3, 6],[1, 4, 7],[2, 5, 8],
    [0, 4, 8],[2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  return null;
}
function getAvailableMoves(squares) {
  return squares
    .map((square, idx) => (square == null ? idx : null))
    .filter((idx) => idx !== null);
}
// Simple AI: first, win if possible, then block, else random
function aiMove(squares, aiSymbol, userSymbol) {
  const available = getAvailableMoves(squares);
  // AI tries to win
  for (let idx of available) {
    const trySquares = [...squares];
    trySquares[idx] = aiSymbol;
    if (calculateWinner(trySquares) === aiSymbol) return idx;
  }
  // Block user win
  for (let idx of available) {
    const trySquares = [...squares];
    trySquares[idx] = userSymbol;
    if (calculateWinner(trySquares) === userSymbol) return idx;
  }
  // Take center if empty
  if (squares[4] === null) return 4;
  // Choose random corner if possible
  const corners = [0,2,6,8].filter((i) => squares[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  // Else random move
  return available[Math.floor(Math.random() * available.length)];
}

// PUBLIC_INTERFACE
// Main App
function App() {
  // Game state
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState("user"); // "user" or "ai"
  const [aiSymbol, setAiSymbol] = useState("O"); // AI is always O unless user picks AI plays X
  const [status, setStatus] = useState("");
  const [gameOver, setGameOver] = useState(false);

  // For responsive mobile touch
  useEffect(() => {
    document.documentElement.style.setProperty("--primary", COLORS.primary);
    document.documentElement.style.setProperty("--accent", COLORS.accent);
    document.documentElement.style.setProperty("--secondary", COLORS.secondary);
  }, []);

  useEffect(() => {
    // AI turn if it's AI's turn and game not over
    if (
      mode === "ai" &&
      !gameOver &&
      ((aiSymbol === "X" && xIsNext) || (aiSymbol === "O" && !xIsNext))
    ) {
      // Small delay to simulate thinking
      const timeout = setTimeout(() => {
        const idx = aiMove(squares, aiSymbol, aiSymbol === "X" ? "O" : "X");
        handleMove(idx);
      }, 600);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line
  }, [xIsNext, mode, aiSymbol, squares, gameOver]);

  useEffect(() => {
    const winner = calculateWinner(squares);
    if (winner) {
      setStatus(winner === "X" ? "X wins!" : "O wins!");
      setGameOver(true);
    } else if (squares.every((sq) => sq !== null)) {
      setStatus("It's a draw!");
      setGameOver(true);
    } else {
      setStatus(
        mode === "ai"
          ? `Turn: ${xIsNext ? "X" : "O"}${
              (aiSymbol === "X" && xIsNext) ||
              (aiSymbol === "O" && !xIsNext)
                ? " (AI)"
                : ""
            }`
          : `Turn: ${xIsNext ? "X" : "O"}`
      );
      setGameOver(false);
    }
    // eslint-disable-next-line
  }, [squares, xIsNext, mode, aiSymbol]);

  // PUBLIC_INTERFACE
  function handleMove(idx) {
    if (gameOver || squares[idx]) return;
    const next = squares.slice();
    next[idx] = xIsNext ? "X" : "O";
    setSquares(next);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function handleBoardClick(idx) {
    // User move
    if (
      mode === "ai" &&
      ((aiSymbol === "X" && xIsNext) || (aiSymbol === "O" && !xIsNext))
    ) {
      // Block manual move during AI move
      return;
    }
    handleMove(idx);
  }

  // PUBLIC_INTERFACE
  function startNewGame(selectedMode = mode, aiAs = aiSymbol) {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setGameOver(false);
    setStatus("");
    setMode(selectedMode);
    setAiSymbol(selectedMode==="ai"? aiAs : "O");
    // If AI is X, let it play first
    if (selectedMode === "ai" && aiAs === "X") {
      setTimeout(() => {
        const idx = aiMove(Array(9).fill(null), "X", "O");
        setSquares((arr) => {
          const copy = arr.slice();
          copy[idx] = "X";
          return copy;
        });
        setXIsNext(false);
      }, 600);
    }
  }

  // PUBLIC_INTERFACE
  function handleReset() {
    startNewGame(mode, aiSymbol);
  }

  // PUBLIC_INTERFACE
  function handleModeChange(e) {
    const val = e.target.value;
    if (val === "user") {
      startNewGame("user", "O");
    } else {
      // Default: AI as O, user as X
      startNewGame("ai", "O");
    }
  }

  return (
    <div className="app-root">
      <div className="game-container">
        <h1 className="title">Tic Tac Toe</h1>
        <div className="mode-row">
          <label htmlFor="mode-select" className="mode-label">
            Mode:
          </label>
          <select
            className="mode-select"
            id="mode-select"
            value={mode}
            onChange={handleModeChange}
            data-testid="mode-select"
          >
            <option value="user">2 Players</option>
            <option value="ai">Single Player (vs AI)</option>
          </select>
          {mode === "ai" && (
            <select
              className="mode-select"
              id="ai-symbol"
              value={aiSymbol}
              onChange={(e) => {
                // If switching AI side, start new game afresh
                const aiAs = e.target.value;
                startNewGame("ai", aiAs);
              }}
              style={{ marginLeft: 10 }}
              data-testid="ai-symbol"
            >
              <option value="O">AI is O</option>
              <option value="X">AI is X</option>
            </select>
          )}
        </div>
        <div className="status-row" data-testid="status">
          {status}
        </div>
        <Board squares={squares} onClick={handleBoardClick} highlight={gameOver ? calculateWinner(squares) : ""}/>
        <div className="controls-row">
          <button
            className="primary-btn"
            onClick={() => startNewGame(mode, aiSymbol)}
            data-testid="new-game-btn"
          >
            Start New Game
          </button>
          <button
            className="secondary-btn"
            onClick={handleReset}
            data-testid="reset-btn"
          >
            Reset
          </button>
        </div>
        <div className="credit-row">
          <span>
            <span role="img" aria-label="Copyright">©</span> 2024 | <a
              href="https://react.dev/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: COLORS.primary }}
            >
              React
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function Board({ squares, onClick, highlight }) {
  return (
    <div className="ttt-board">
      {Array(3)
        .fill(0)
        .map((_, row) => (
          <div key={row} className="board-row">
            {Array(3)
              .fill(0)
              .map((_, col) => {
                const idx = row * 3 + col;
                return (
                  <Square
                    key={idx}
                    value={squares[idx]}
                    onClick={() => onClick(idx)}
                    highlight={highlight && squares[idx] === highlight}
                  />
                );
              })}
          </div>
        ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function Square({ value, onClick, highlight }) {
  return (
    <button
      className={`ttt-square${highlight ? " win" : ""}`}
      onClick={onClick}
      disabled={value != null}
      data-testid="square"
      tabIndex={0}
      aria-label={"Tic tac toe square" + (value ? `, ${value}` : "")}
    >
      <span>{value}</span>
    </button>
  );
}

export default App;
