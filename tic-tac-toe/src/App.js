import React, { useState, useEffect, useRef } from "react";

const clickSoundSrc = "https://actions.google.com/sounds/v1/ui/click.ogg";
const winSoundSrc = "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg";
const drawSoundSrc = "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg";

const playSound = (src) => {
  const sound = new Audio(src);
  sound.play().catch(() => {});
};

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

function calculateWinner(squares) {
  for (let combo of winningCombinations) {
    const [a, b, c] = combo;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], line: combo };
    }
  }
  if (squares.every(Boolean)) {
    return { winner: "Draw", line: [] };
  }
  return { winner: null, line: [] };
}

// Minimax AI for O (computer)
function minimax(newBoard, player) {
  const huPlayer = "X";
  const aiPlayer = "O";
  const availSpots = newBoard.reduce(
    (acc, val, idx) => (val === null ? acc.concat(idx) : acc),
    []
  );

  const winner = calculateWinner(newBoard);
  if (winner.winner === huPlayer) {
    return { score: -10 };
  } else if (winner.winner === aiPlayer) {
    return { score: 10 };
  } else if (availSpots.length === 0) {
    return { score: 0 };
  }

  const moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    const idx = availSpots[i];
    const move = {};
    move.index = idx;
    newBoard[idx] = player;

    if (player === aiPlayer) {
      const result = minimax(newBoard, huPlayer);
      move.score = result.score;
    } else {
      const result = minimax(newBoard, aiPlayer);
      move.score = result.score;
    }

    newBoard[idx] = null;
    moves.push(move);
  }

  let bestMove;
  if (player === aiPlayer) {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = moves[i];
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = moves[i];
      }
    }
  }
  return bestMove;
}

export default function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winnerInfo, setWinnerInfo] = useState({ winner: null, line: [] });
  const [isSinglePlayer, setIsSinglePlayer] = useState(true);
  const [timer, setTimer] = useState(10);
  const timerRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleClick = (index) => {
    if (board[index] || winnerInfo.winner || gameOver || showModal) return;

    const newBoard = board.slice();
    newBoard[index] = xIsNext ? "X" : "O";
    playSound(clickSoundSrc);
    setBoard(newBoard);

    const result = calculateWinner(newBoard);
    if (result.winner) {
      setWinnerInfo(result);
      setGameOver(true);
      setShowModal(true);
      if (result.winner === "Draw") {
        playSound(drawSoundSrc);
      } else {
        playSound(winSoundSrc);
      }
      clearInterval(timerRef.current);
      return;
    }

    setXIsNext(!xIsNext);
    setTimer(10);
  };

  // Computer Move using Minimax
  useEffect(() => {
    if (!isSinglePlayer || xIsNext || winnerInfo.winner || gameOver || showModal) return;

    const timerId = setTimeout(() => {
      const bestMove = minimax(board.slice(), "O");
      if (bestMove && bestMove.index !== undefined) {
        handleClick(bestMove.index);
      }
    }, 700);

    return () => clearTimeout(timerId);
  }, [board, isSinglePlayer, xIsNext, winnerInfo, gameOver, showModal]);

  useEffect(() => {
    if (winnerInfo.winner || gameOver || showModal) return;

    timerRef.current = setInterval(() => {
      setTimer((time) => {
        if (time <= 1) {
          setXIsNext((prev) => !prev);
          return 10;
        }
        return time - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [winnerInfo, gameOver, showModal]);

  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinnerInfo({ winner: null, line: [] });
    setGameOver(false);
    setTimer(10);
    setShowModal(false);
  };

  const isWinningCell = (index) => winnerInfo.line.includes(index);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-700 via-pink-600 to-yellow-400 flex flex-col items-center justify-center p-6 text-white font-sans relative">
      <h1 className="text-4xl font-bold mb-4 drop-shadow-lg text-yellow-100">Tic-Tac-Toe</h1>

      <div className="mb-4 space-x-4">
        <button
          onClick={() => {
            restartGame();
            setIsSinglePlayer(true);
          }}
          className={`px-4 py-2 rounded ${isSinglePlayer ? "bg-yellow-300 text-purple-900 font-bold" : "bg-purple-900 text-yellow-300"}`}
          disabled={showModal}
        >
          1 Player
        </button>
        <button
          onClick={() => {
            restartGame();
            setIsSinglePlayer(false);
          }}
          className={`px-4 py-2 rounded ${!isSinglePlayer ? "bg-yellow-300 text-purple-900 font-bold" : "bg-purple-900 text-yellow-300"}`}
          disabled={showModal}
        >
          2 Player
        </button>
      </div>

      <div
        className={`grid grid-cols-3 gap-3 bg-purple-900 rounded-lg p-4 shadow-lg w-[300px] h-[300px] ${showModal ? "pointer-events-none opacity-50" : "opacity-100"}`}
      >
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(idx)}
            className={`text-4xl font-extrabold rounded-lg bg-yellow-200 text-purple-900 flex items-center justify-center cursor-pointer
              hover:bg-yellow-300
              ${isWinningCell(idx) ? "bg-green-400 animate-pulse" : ""}
            `}
            style={{ transition: "background-color 0.3s ease" }}
            aria-label={`Cell ${idx + 1}`}
            disabled={showModal}
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="mt-4 text-lg">
        {!winnerInfo.winner && (
          <>
            <p>Turn: <span className="font-semibold">{xIsNext ? "X" : "O"}</span></p>
            <p className="mt-2 text-yellow-200" role="timer" aria-live="polite">
              Timer: ⏰ {timer}s
            </p>
          </>
        )}
      </div>

      <button
        onClick={restartGame}
        className="mt-6 bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-semibold px-6 py-2 rounded shadow-md transition-colors duration-300"
        disabled={showModal}
      >
        Restart Game
      </button>

      <footer className="mt-10 text-yellow-100 text-sm font-semibold select-none">
        Developed by <span className="underline">HENIL PATEL</span>
      </footer>

    {/* Add this inside your JSX, replacing the current winner modal: */}

{showModal && (
  <>
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white bg-opacity-20 backdrop-blur-md rounded-3xl p-10 w-full max-w-md text-center shadow-xl border border-white/30 animate-fadeIn">
        <div className="text-7xl mb-4">
          {winnerInfo.winner === "Draw" ? "🤝" : winnerInfo.winner === "X" ? "❌" : "⭕️"}
        </div>
        <h2 className="text-4xl font-extrabold mb-4 text-yellow-400 drop-shadow-lg">
          {winnerInfo.winner === "Draw"
            ? "It's a Draw!"
            : `Winner: ${winnerInfo.winner}`}
        </h2>
        <button
          onClick={restartGame}
          className="mt-2 bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold px-8 py-3 rounded-full shadow-lg transition duration-300"
          aria-label="Close winner popup and restart game"
        >
          Play Again
        </button>
      </div>
    </div>

    {/* Full screen confetti container */}
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {[...Array(100)].map((_, i) => (
        <span
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}vw`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 3}s`,
            fontSize: `${12 + Math.random() * 24}px`,
            opacity: 0.8 + Math.random() * 0.2,
          }}
        >
          🎉
        </span>
      ))}
    </div>

    <style>{`
      @keyframes confetti-fall {
        0% {
          transform: translateY(-10vh) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(110vh) rotate(360deg);
          opacity: 0;
        }
      }
      .confetti {
        position: fixed;
        top: -5vh;
        animation-name: confetti-fall;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        user-select: none;
        pointer-events: none;
      }
      @keyframes fadeIn {
        from {opacity: 0; transform: translateY(-10px);}
        to {opacity: 1; transform: translateY(0);}
      }
      .animate-fadeIn {
        animation: fadeIn 0.5s ease forwards;
      }
    `}</style>
  </>
)}

    </div>
  );
}
