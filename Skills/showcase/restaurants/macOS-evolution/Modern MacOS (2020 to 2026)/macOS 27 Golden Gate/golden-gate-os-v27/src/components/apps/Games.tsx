import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft01Icon, GameController01Icon, ComputerIcon } from 'hugeicons-react';

type GameType = 'snake' | 'memory' | 'tictactoe' | null;

type EmulatorGame = 'ps2' | 'psp' | 'ps1';

const STORAGE_KEY = 'golden_gate_games_unlocked';

const EMULATOR_GAMES: Record<string, { title: string; desc: string; system: string; icon: string; url: string; color: string }> = {
  ps2: {
    title: 'Space Shooter (PS2)',
    desc: 'Play a PS2 space shooter using Play!.js — load your own PS2 ISO',
    system: 'PlayStation 2',
    icon: '🎮',
    url: 'https://playjs.purei.org/',
    color: 'from-indigo-900/50 to-indigo-700/30',
  },
  psp: {
    title: 'Cars 2 (PSP)',
    desc: 'Play Cars 2 via EmulatorJS — load your own PSP ISO in the emulator',
    system: 'PSP',
    icon: '🏎️',
    url: '/emulatorjs/player.html?system=psp&v=6',
    color: 'from-blue-900/50 to-blue-700/30',
  },
  ps1: {
    title: 'Gran Turismo 2 (PS1)',
    desc: 'Play Gran Turismo 2 via EmulatorJS — load your own PS1 ROM in the emulator',
    system: 'PlayStation',
    icon: '🏁',
    url: '/emulatorjs/player.html?system=psx&v=6',
    color: 'from-emerald-900/50 to-emerald-700/30',
  },
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const GameCard = ({ title, desc, color, icon, onClick }: any) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={`${color} rounded-3xl p-8 cursor-pointer border border-white/10 shadow-lg flex flex-col items-center justify-center text-center gap-4`}
  >
    <div className="text-5xl">{icon}</div>
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="text-sm text-white/60">{desc}</p>
  </motion.div>
);

const EmulatorGameCard = ({ game, onClick }: { game: string; onClick: () => void }) => {
  const g = EMULATOR_GAMES[game];
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`bg-gradient-to-br ${g.color} rounded-3xl p-8 cursor-pointer border border-white/10 shadow-lg flex flex-col items-center justify-center text-center gap-4`}
    >
      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">{g.icon}</div>
      <h3 className="text-xl font-bold">{g.title}</h3>
      <div className="text-xs text-white/40 uppercase tracking-wider bg-white/5 px-3 py-1 rounded-full">{g.system}</div>
      <p className="text-sm text-white/60">{g.desc}</p>
    </motion.div>
  );
};

const EmulatorView: React.FC<{ game: EmulatorGame; onBack: () => void }> = ({ game, onBack }) => {
  const g = EMULATOR_GAMES[game];
  return (
    <div className="flex flex-col h-full w-full bg-zinc-900">
      <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs transition text-white/70 hover:text-white"
        >
          <ArrowLeft01Icon size={14} /> Back to Emulator
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40">{g.system}</span>
          <h3 className="text-sm font-bold">{g.title}</h3>
        </div>
        <div className="text-xs text-white/30 italic">Load your own ROM</div>
      </div>
      <div className="flex-1 bg-black/50 relative">
        <iframe
          src={g.url}
          className="w-full h-full border-0"
          title={g.title}
          allow="autoplay; clipboard-write; encrypted-media; gamepad; pointer-lock; cross-origin-isolated"
        />
      </div>
    </div>
  );
};

const SnakeGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const GRID = 20;
  const CELL = 16;
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      e.preventDefault();
      const keyMap: Record<string, { x: number; y: number }> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };
      const newDir = keyMap[e.key];
      if (newDir && (newDir.x !== -dir.x || newDir.y !== -dir.y)) setDir(newDir);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir, gameOver]);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDir({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
    setPaused(false);
  };

  useEffect(() => {
    if (gameOver || paused) return;
    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };
        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
          setGameOver(true);
          return prev;
        }
        if (prev.some((s) => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          return prev;
        }
        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore((s) => s + 1);
          setFood({ x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [dir, food, gameOver, paused]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center justify-between w-full max-w-[400px]">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs transition"
        >
          <ArrowLeft01Icon size={14} /> Back
        </button>
        <span className="text-lg font-bold">Score: {score}</span>
        <button
          onClick={() => setPaused((p) => !p)}
          className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs transition"
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>
      {gameOver ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="text-4xl">💀</div>
          <h3 className="text-2xl font-bold">Game Over</h3>
          <p className="text-white/50">Score: {score}</p>
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium text-sm transition"
          >
            Play Again
          </button>
        </div>
      ) : (
        <div
          className="grid bg-zinc-800 rounded-lg border border-white/10 overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${GRID}, ${CELL}px)`, width: GRID * CELL, height: GRID * CELL }}
        >
          {Array.from({ length: GRID * GRID }).map((_, i) => {
            const x = i % GRID;
            const y = Math.floor(i / GRID);
            const isSnake = snake.some((s) => s.x === x && s.y === y);
            const isHead = snake[0]?.x === x && snake[0]?.y === y;
            const isFood = food.x === x && food.y === y;
            return (
              <div key={i} className="flex items-center justify-center" style={{ width: CELL, height: CELL }}>
                {isHead && (
                  <div className="w-full h-full bg-green-400 rounded-sm shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                )}
                {isSnake && !isHead && <div className="w-[90%] h-[90%] bg-green-600 rounded-sm" />}
                {isFood && (
                  <div className="w-[80%] h-[80%] bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MemoryGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const emojis = ['🎮', '🚀', '🌈', '⭐', '🎯', '🎨', '🎵', '💎'];
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>(() =>
    [...emojis, ...emojis].sort(() => Math.random() - 0.5).map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }))
  );
  const [, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [, setMatchedPairs] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const lockRef = useRef(false);

  const handleFlip = (id: number) => {
    if (lockRef.current) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)));
    setFlipped((prev) => {
      const next = [...prev, id];
      if (next.length === 2) {
        setMoves((m) => m + 1);
        lockRef.current = true;
        const [first, second] = next.map((i) => cards.find((c) => c.id === i)!);
        if (first.emoji === second.emoji) {
          setCards((prev) => prev.map((c) => (c.emoji === first.emoji ? { ...c, matched: true } : c)));
          setMatchedPairs((p) => {
            const np = p + 1;
            if (np === emojis.length) setGameWon(true);
            return np;
          });
          setFlipped([]);
          lockRef.current = false;
        } else {
          setTimeout(() => {
            setCards((prev) => prev.map((c) => (next.includes(c.id) ? { ...c, flipped: false } : c)));
            setFlipped([]);
            lockRef.current = false;
          }, 800);
        }
      }
      return next;
    });
  };

  const resetGame = () => {
    const deck = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    setCards(deck);
    setFlipped([]);
    setMoves(0);
    setMatchedPairs(0);
    setGameWon(false);
    lockRef.current = false;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center justify-between w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs transition"
        >
          <ArrowLeft01Icon size={14} /> Back
        </button>
        <span className="text-lg font-bold">Moves: {moves}</span>
        <button onClick={resetGame} className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs transition">
          Reset
        </button>
      </div>
      {gameWon ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="text-4xl">🎉</div>
          <h3 className="text-2xl font-bold">You Won!</h3>
          <p className="text-white/50">Completed in {moves} moves</p>
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium text-sm transition"
          >
            Play Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              onClick={() => handleFlip(card.id)}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl cursor-pointer border transition-all ${card.flipped || card.matched ? 'bg-white/10 border-white/20' : 'bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30'}`}
              animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {card.flipped || card.matched ? card.emoji : '❓'}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const TicTacToe: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [board, setBoard] = useState<string[]>(Array(9).fill(''));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<string | null>(null);

  const checkWinner = (b: string[]): string | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const [a, b_, c] of lines) {
      if (b[a] && b[a] === b[b_] && b[a] === b[c]) return b[a];
    }
    return b.every((c) => c) ? 'Draw' : null;
  };

  const handleClick = (i: number) => {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = turn;
    setBoard(newBoard);
    const w = checkWinner(newBoard);
    if (w) {
      setWinner(w);
    } else {
      setTurn((prev) => (prev === 'X' ? 'O' : 'X'));
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(''));
    setTurn('X');
    setWinner(null);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center justify-between w-full max-w-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs transition"
        >
          <ArrowLeft01Icon size={14} /> Back
        </button>
        <span className="text-lg font-bold">
          {winner ? (winner === 'Draw' ? 'Draw!' : `${winner} Wins!`) : `${turn}'s Turn`}
        </span>
        <button onClick={resetGame} className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs transition">
          Reset
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <div
            key={i}
            onClick={() => handleClick(i)}
            className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black cursor-pointer border transition-all ${cell ? (cell === 'X' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'bg-red-500/20 border-red-500/40 text-red-400') : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
          >
            {cell}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Games: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<GameType>(null);
  const [activeTab, setActiveTab] = useState<'native' | 'emulator'>('native');
  const [activeEmulator, setActiveEmulator] = useState<EmulatorGame | null>(null);
  const [paid, setPaid] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');

  if (!paid) {
    return (
      <div className="h-full w-full bg-zinc-900 text-white flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-purple-500/20 flex items-center justify-center">
          <img src="/icons/games.png" alt="Games" className="w-14 h-14 object-contain" />
        </div>
        <h2 className="text-2xl font-bold">Games</h2>
        <p className="text-white/50 text-sm">Play classic arcade games.</p>
        <button
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, 'true');
            setPaid(true);
          }}
          className="px-6 py-2.5 bg-purple-500 hover:bg-purple-600 rounded-xl font-medium text-sm transition"
        >
          Continue
        </button>
      </div>
    );
  }

  if (activeEmulator) {
    return <EmulatorView game={activeEmulator} onBack={() => setActiveEmulator(null)} />;
  }

  if (selectedGame === 'snake') return <SnakeGame onBack={() => setSelectedGame(null)} />;
  if (selectedGame === 'memory') return <MemoryGame onBack={() => setSelectedGame(null)} />;
  if (selectedGame === 'tictactoe') return <TicTacToe onBack={() => setSelectedGame(null)} />;

  return (
    <div className="h-full w-full bg-zinc-900 text-white overflow-y-auto flex flex-col">
      <div className="flex border-b border-white/10 shrink-0">
        <button
          onClick={() => setActiveTab('native')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 ${
            activeTab === 'native' ? 'border-purple-500 text-white' : 'border-transparent text-white/40 hover:text-white/70'
          }`}
        >
          <GameController01Icon size={16} /> Native
        </button>
        <button
          onClick={() => setActiveTab('emulator')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 ${
            activeTab === 'emulator' ? 'border-purple-500 text-white' : 'border-transparent text-white/40 hover:text-white/70'
          }`}
        >
          <ComputerIcon size={16} /> Emulator
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'native' && (
          <motion.div
            key="native"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-8"
          >
            <h2 className="text-2xl font-bold mb-2">Native Games</h2>
            <p className="text-white/40 text-sm mb-8">Choose a game to play</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl">
              <GameCard
                title="Snake"
                desc="Classic snake game. Eat food, grow, avoid walls!"
                color="bg-gradient-to-br from-green-900/50 to-green-800/30"
                icon="🐍"
                onClick={() => setSelectedGame('snake')}
              />
              <GameCard
                title="Memory Match"
                desc="Flip cards and find matching pairs."
                color="bg-gradient-to-br from-purple-900/50 to-purple-800/30"
                icon="🎴"
                onClick={() => setSelectedGame('memory')}
              />
              <GameCard
                title="Tic-Tac-Toe"
                desc="Classic 3-in-a-row with a friend."
                color="bg-gradient-to-br from-blue-900/50 to-blue-800/30"
                icon="❌"
                onClick={() => setSelectedGame('tictactoe')}
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'emulator' && (
          <motion.div
            key="emulator"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-8"
          >
            <h2 className="text-2xl font-bold mb-2">Emulator</h2>
            <p className="text-white/40 text-sm mb-8">
              Load your own game ROMs and play them in browser-based emulators
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
              <EmulatorGameCard game="ps2" onClick={() => setActiveEmulator('ps2')} />
              <EmulatorGameCard game="psp" onClick={() => setActiveEmulator('psp')} />
              <EmulatorGameCard game="ps1" onClick={() => setActiveEmulator('ps1')} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
