import React, { useState, useCallback, useRef, useEffect } from 'react';

type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
type PieceColor = 'white' | 'black';

interface Piece { type: PieceType; color: PieceColor }

type Board = (Piece | null)[][];

const PIECE_UNICODE: Record<PieceColor, Record<PieceType, string>> = {
  white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
  black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
};

const PIECE_NAMES: Record<PieceType, string> = {
  pawn: 'pawn', rook: 'rook', knight: 'knight', bishop: 'bishop', queen: 'queen', king: 'king',
};

let siriVoice: SpeechSynthesisVoice | null = null;

function loadSiriVoice() {
  if ('speechSynthesis' in window) {
    const voices = speechSynthesis.getVoices();
    siriVoice = voices.find(v =>
      v.lang.startsWith('en-US') && v.name.toLowerCase().includes('samantha')
    ) || voices.find(v =>
      v.lang.startsWith('en-US')
    ) || null;
  }
}

if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = loadSiriVoice;
  loadSiriVoice();
}

let speechEndCallback: (() => void) | null = null;

function speak(text: string) {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (siriVoice) utterance.voice = siriVoice;
    utterance.rate = 0.82;
    utterance.pitch = 0.95;
    utterance.volume = 0.85;
    utterance.onend = () => {
      if (speechEndCallback) {
        const cb = speechEndCallback;
        speechEndCallback = null;
        cb();
      }
    };
    speechSynthesis.speak(utterance);
  } else if (speechEndCallback) {
    const cb = speechEndCallback;
    speechEndCallback = null;
    cb();
  }
}

function createInitialBoard(): Board {
  const backRow: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  const board: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRow[c], color: 'black' };
    board[1][c] = { type: 'pawn', color: 'black' };
    board[6][c] = { type: 'pawn', color: 'white' };
    board[7][c] = { type: backRow[c], color: 'white' };
  }
  return board;
}

function cloneBoard(b: Board): Board {
  return b.map(row => row.map(cell => cell ? { ...cell } : null));
}

function findKing(b: Board, color: PieceColor): [number, number] | null {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (b[r][c]?.type === 'king' && b[r][c]?.color === color) return [r, c];
  return null;
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function isInCheck(b: Board, color: PieceColor): boolean {
  const k = findKing(b, color);
  if (!k) return true;
  const enemy: PieceColor = color === 'white' ? 'black' : 'white';
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (b[r][c]?.color === enemy)
        if (rawMoves(b, r, c, b[r][c]!).some(m => m[0] === k[0] && m[1] === k[1]))
          return true;
  return false;
}

function rawMoves(b: Board, r: number, c: number, p: Piece): [number, number][] {
  const moves: [number, number][] = [];
  const enemy = (target?: Piece | null) => target && target.color !== p.color;
  const empty = (target?: Piece | null) => !target;

  if (p.type === 'pawn') {
    const dir = p.color === 'white' ? -1 : 1;
    const startRow = p.color === 'white' ? 6 : 1;
    if (inBounds(r + dir, c) && empty(b[r + dir][c])) moves.push([r + dir, c]);
    if (r === startRow && inBounds(r + 2 * dir, c) && empty(b[r + 2 * dir][c]) && empty(b[r + dir][c])) moves.push([r + 2 * dir, c]);
    for (const dc of [-1, 1]) {
      if (inBounds(r + dir, c + dc) && enemy(b[r + dir][c + dc])) moves.push([r + dir, c + dc]);
    }
    return moves;
  }

  if (p.type === 'knight') {
    const knightDirs: [number, number][] = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for (const [dr, dc] of knightDirs) {
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && b[nr][nc]?.color !== p.color) moves.push([nr, nc]);
    }
    return moves;
  }

  if (p.type === 'king') {
    const kingDirs: [number, number][] = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    for (const [dr, dc] of kingDirs) {
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && b[nr][nc]?.color !== p.color) moves.push([nr, nc]);
    }
    return moves;
  }

  const slideDirs: Record<string, [number, number][]> = {
    rook: [[-1,0],[1,0],[0,-1],[0,1]],
    bishop: [[-1,-1],[-1,1],[1,-1],[1,1]],
    queen: [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]],
  };

  for (const [dr, dc] of slideDirs[p.type]) {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      if (b[nr][nc]) {
        if (b[nr][nc]!.color !== p.color) moves.push([nr, nc]);
        break;
      }
      moves.push([nr, nc]);
      nr += dr; nc += dc;
    }
  }
  return moves;
}

function legalMoves(b: Board, r: number, c: number): [number, number][] {
  const p = b[r][c];
  if (!p) return [];
  return rawMoves(b, r, c, p).filter(([tr, tc]) => {
    const nb = cloneBoard(b);
    nb[tr][tc] = nb[r][c];
    nb[r][c] = null;
    return !isInCheck(nb, p.color);
  });
}

function hasLegalMoves(b: Board, color: PieceColor): boolean {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (b[r][c]?.color === color && legalMoves(b, r, c).length > 0) return true;
  return false;
}

function getGameStatus(b: Board, turn: PieceColor): 'playing' | 'check' | 'checkmate' | 'stalemate' {
  const check = isInCheck(b, turn);
  if (!hasLegalMoves(b, turn)) return check ? 'checkmate' : 'stalemate';
  if (check) return 'check';
  return 'playing';
}

function applyMove(b: Board, fr: number, fc: number, tr: number, tc: number): Board {
  const nb = cloneBoard(b);
  nb[tr][tc] = nb[fr][fc];
  nb[fr][fc] = null;
  return nb;
}

const PIECE_VALS: Record<PieceType, number> = {
  pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000,
};

function evaluate(b: Board): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (!p) continue;
      const sign = p.color === 'white' ? 1 : -1;
      score += sign * PIECE_VALS[p.type];
    }
  }
  return score;
}

function minimax(b: Board, depth: number, alpha: number, beta: number, isMax: boolean): number {
  if (depth === 0) return evaluate(b);
  const color: PieceColor = isMax ? 'white' : 'black';
  const allMoves: { fr: number; fc: number; tr: number; tc: number }[] = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (b[r][c]?.color === color)
        for (const [tr, tc] of legalMoves(b, r, c))
          allMoves.push({ fr: r, fc: c, tr, tc });

  if (isMax) {
    let maxEval = -Infinity;
    for (const m of allMoves) {
      const nb = applyMove(b, m.fr, m.fc, m.tr, m.tc);
      const e = minimax(nb, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, e);
      alpha = Math.max(alpha, e);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const m of allMoves) {
      const nb = applyMove(b, m.fr, m.fc, m.tr, m.tc);
      const e = minimax(nb, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, e);
      beta = Math.min(beta, e);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function bestMove(b: Board, color: PieceColor): { fr: number; fc: number; tr: number; tc: number } | null {
  const allMoves: { fr: number; fc: number; tr: number; tc: number }[] = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (b[r][c]?.color === color)
        for (const [tr, tc] of legalMoves(b, r, c))
          allMoves.push({ fr: r, fc: c, tr, tc });

  if (allMoves.length === 0) return null;
  const isMax = color === 'white';

  const isCapture = (m: { tr: number; tc: number }) => b[m.tr][m.tc] !== null;

  allMoves.sort((m1, m2) => {
    const cap1 = isCapture(m1) ? PIECE_VALS[b[m1.tr][m1.tc]!.type] * 10 : 0;
    const cap2 = isCapture(m2) ? PIECE_VALS[b[m2.tr][m2.tc]!.type] * 10 : 0;
    return cap2 - cap1;
  });

  let best = allMoves[0];
  let bestScore = isMax ? -Infinity : Infinity;

  for (const m of allMoves) {
    const nb = applyMove(b, m.fr, m.fc, m.tr, m.tc);
    const score = minimax(nb, 2, -Infinity, Infinity, !isMax);
    if (isMax ? score > bestScore : score < bestScore) {
      bestScore = score;
      best = m;
    }
  }
  return best;
}

type ChessMode = 'friend' | 'computer' | null;

export const Chess: React.FC = () => {
  const [mode, setMode] = useState<ChessMode>(null);
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [turn, setTurn] = useState<PieceColor>('white');
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [status, setStatus] = useState<string>('playing');
  const [thinking, setThinking] = useState(false);
  const [showPromotion, setShowPromotion] = useState<{ r: number; c: number } | null>(null);
  const [moveLog, setMoveLog] = useState<string[]>([]);
  const aiTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPlayerTurn = mode === 'friend' || turn === 'white';

  const doMove = useCallback((fr: number, fc: number, tr: number, tc: number, promotionType?: PieceType) => {
    const captured = board[tr][tc];
    const movingPiece = board[fr][fc];
    let logEntry = '';

    const colorName = movingPiece!.color === 'white' ? 'White' : 'Black';
    if (captured) {
      const capturedColor = captured.color === 'white' ? 'White' : 'Black';
      logEntry = `${colorName} ${PIECE_NAMES[movingPiece!.type]} takes ${capturedColor} ${PIECE_NAMES[captured.type]}`;
    } else {
      logEntry = `${colorName} ${PIECE_NAMES[movingPiece!.type]} ${String.fromCharCode(97 + fc)}${8 - fr} to ${String.fromCharCode(97 + tc)}${8 - tr}`;
    }
    speak(logEntry);

    let nb = applyMove(board, fr, fc, tr, tc);
    if (promotionType) {
      nb[tr][tc] = { type: promotionType, color: turn };
      logEntry += ` promotes to ${PIECE_NAMES[promotionType]}`;
      speak(`${PIECE_NAMES[promotionType]} promotion`);
    }

    setBoard(nb);
    setMoveLog(prev => [...prev, logEntry]);
    const nextTurn: PieceColor = turn === 'white' ? 'black' : 'white';
    setTurn(nextTurn);
    setSelected(null);
    setValidMoves([]);
    setShowPromotion(null);

    const s = getGameStatus(nb, nextTurn);
    if (s === 'checkmate') {
      const winner = turn === 'white' ? 'White' : 'Black';
      setStatus(`Checkmate! ${winner} wins!`);
      speak(`Checkmate! ${winner} wins!`);
    } else if (s === 'stalemate') {
      setStatus('Stalemate!');
      speak('Stalemate!');
    } else if (s === 'check') {
      setStatus('Check!');
      speak('Check!');
    } else setStatus('playing');
  }, [board, turn]);

  const doMoveRef = useRef(doMove);
  doMoveRef.current = doMove;
  const boardRef = useRef(board);
  boardRef.current = board;
  const turnRef = useRef(turn);
  turnRef.current = turn;

  const handleSquareClick = useCallback((r: number, c: number) => {
    if (status === 'checkmate' || status === 'stalemate') return;
    if (!isPlayerTurn || thinking) return;
    if (showPromotion) return;

    if (selected) {
      const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c);
      if (isValid) {
        const fr = selected[0], fc = selected[1];
        const movingPiece = board[fr][fc];
        if (movingPiece?.type === 'pawn' && (r === 0 || r === 7)) {
          setShowPromotion({ r, c });
          return;
        }
        doMove(fr, fc, r, c);
        return;
      }
      if (board[r][c]?.color === turn) {
        setSelected([r, c]);
        setValidMoves(legalMoves(board, r, c));
        return;
      }
      setSelected(null);
      setValidMoves([]);
      return;
    }

    if (board[r][c]?.color === turn) {
      setSelected([r, c]);
      setValidMoves(legalMoves(board, r, c));
    }
  }, [board, turn, selected, validMoves, status, isPlayerTurn, thinking, showPromotion, doMove]);

  useEffect(() => {
    if (mode === 'computer' && turn === 'black' && status === 'playing' && !showPromotion) {
      setThinking(true);
      const scheduleAI = () => {
        aiTimeout.current = setTimeout(() => {
          const b = boardRef.current;
          const move = bestMove(b, 'black');
          if (move) {
            doMoveRef.current(move.fr, move.fc, move.tr, move.tc);
          }
          setThinking(false);
        }, 300);
      };
      if ('speechSynthesis' in window && speechSynthesis.speaking) {
        speechEndCallback = scheduleAI;
      } else {
        scheduleAI();
      }
    }
    return () => {
      if (aiTimeout.current) clearTimeout(aiTimeout.current);
      speechEndCallback = null;
    };
  }, [turn, mode, status, showPromotion]);

  const resetGame = () => {
    if (aiTimeout.current) clearTimeout(aiTimeout.current);
    setBoard(createInitialBoard());
    setTurn('white');
    setSelected(null);
    setValidMoves([]);
    setStatus('playing');
    setThinking(false);
    setShowPromotion(null);
    setMoveLog([]);
  };

  const isDark = (r: number, c: number) => (r + c) % 2 === 1;

  if (!mode) {
    return (
      <div className="h-full w-full bg-zinc-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-8 p-8">
          <div className="text-7xl">♔</div>
          <h1 className="text-3xl font-bold">Chess</h1>
          <p className="text-white/50 text-sm">Choose a mode to play</p>
          <div className="flex gap-4">
            <button
              onClick={() => setMode('friend')}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-lg font-medium transition border border-white/10"
            >
              👥 Friend
            </button>
            <button
              onClick={() => setMode('computer')}
              className="px-8 py-3 bg-amber-600/40 hover:bg-amber-600/60 rounded-2xl text-lg font-medium transition border border-amber-500/30"
            >
              🤖 Computer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-zinc-900 text-white overflow-y-auto">
      <div className="p-4 md:p-6 flex flex-col items-center">
        <div className="flex items-center justify-between w-full max-w-3xl mb-4">
          <button onClick={() => { setMode(null); resetGame(); }} className="flex items-center gap-1 px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs transition">
            ← Modes
          </button>
          <div className="text-center">
            <div className="text-lg font-bold">{mode === 'friend' ? 'Chess — 2 Player' : 'Chess — vs Computer'}</div>
          </div>
          <button onClick={resetGame} className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs transition">New Game</button>
        </div>

        <div className="text-sm mb-4 h-6 font-medium">
          {thinking ? <span className="text-yellow-400">AI thinking...</span> :
           status === 'playing' ? <span className="text-white/60">{turn === 'white' ? "White" : "Black"}'s turn</span> :
           <span className="text-2xl font-black">{status}</span>}
        </div>

        <div className="flex gap-6 w-full max-w-3xl">
          <div className="grid grid-cols-8 rounded-xl overflow-hidden border border-white/10 shadow-2xl flex-shrink-0">
            {board.flat().map((piece, i) => {
              const r = Math.floor(i / 8);
              const c = i % 8;
              const isSelected = selected?.[0] === r && selected?.[1] === c;
              const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c);
              return (
                <div
                  key={i}
                  onClick={() => handleSquareClick(r, c)}
                  className={`w-10 h-10 md:w-14 md:h-14 flex items-center justify-center text-2xl md:text-4xl cursor-pointer transition-colors relative select-none
                    ${isDark(r, c) ? 'bg-emerald-800/60' : 'bg-stone-200/10'}
                    ${isSelected ? 'ring-2 ring-yellow-400 ring-inset' : ''}
                  `}
                >
                  {isValid && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {piece ? (
                        <div className="w-full h-full ring-2 ring-red-500/60 ring-inset rounded-full" />
                      ) : (
                        <div className={`w-3 h-3 rounded-full ${isDark(r, c) ? 'bg-white/30' : 'bg-black/20'}`} />
                      )}
                    </div>
                  )}
                  {piece && (
                    <span
                      className="drop-shadow-lg"
                      style={{
                        color: piece.color === 'white' ? '#f0f0f0' : '#1a1a1a',
                        filter: piece.color === 'white'
                          ? 'drop-shadow(0 0 3px rgba(0,0,0,0.6))'
                          : 'drop-shadow(0 0 2px rgba(255,255,255,0.3))'
                      }}
                    >
                      {PIECE_UNICODE[piece.color][piece.type]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex-1 hidden md:block">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 h-full max-h-[33rem] overflow-y-auto">
              <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3">Move Log</h3>
              {moveLog.length === 0 && <p className="text-white/20 text-xs">No moves yet</p>}
              {moveLog.map((entry, i) => (
                <div key={i} className="text-xs text-white/60 py-1 border-b border-white/5 last:border-0">
                  <span className="text-white/30 mr-2">{i + 1}.</span>
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </div>

        {showPromotion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowPromotion(null)}>
            <div className="bg-zinc-800 rounded-2xl p-6 border border-white/20 flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
              <div className="text-sm font-medium text-white/60">Promote pawn to:</div>
              <div className="flex gap-3">
                {(['queen', 'rook', 'bishop', 'knight'] as PieceType[]).map(pt => (
                  <div
                    key={pt}
                    onClick={() => doMove(selected![0], selected![1], showPromotion.r, showPromotion.c, pt)}
                    className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-3xl cursor-pointer transition-colors border border-white/10"
                  >
                    {PIECE_UNICODE[turn][pt]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
