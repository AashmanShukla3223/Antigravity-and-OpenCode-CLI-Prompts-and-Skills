import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeft01Icon } from 'hugeicons-react';

type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
type PieceColor = 'white' | 'black';

interface Piece { type: PieceType; color: PieceColor }

type Board = (Piece | null)[][];

const PIECE_UNICODE: Record<PieceColor, Record<PieceType, string>> = {
  white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
  black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
};

const LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

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

interface ChessProps {
  onBack: () => void;
  mode: 'friend' | 'computer';
}

export const Chess: React.FC<ChessProps> = ({ onBack, mode }) => {
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [turn, setTurn] = useState<PieceColor>('white');
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [status, setStatus] = useState<string>('playing');
  const [thinking, setThinking] = useState(false);
  const [showPromotion, setShowPromotion] = useState<{ r: number; c: number } | null>(null);
  const aiTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPlayerTurn = mode === 'friend' || turn === 'white';

  const doMove = useCallback((fr: number, fc: number, tr: number, tc: number, promotionType?: PieceType) => {
    let nb = applyMove(board, fr, fc, tr, tc);
    if (promotionType) {
      nb[tr][tc] = { type: promotionType, color: turn };
    }
    setBoard(nb);
    const nextTurn: PieceColor = turn === 'white' ? 'black' : 'white';
    setTurn(nextTurn);
    setSelected(null);
    setValidMoves([]);
    setShowPromotion(null);

    const s = getGameStatus(nb, nextTurn);
    if (s === 'checkmate') setStatus('Checkmate! ' + (turn === 'white' ? 'White' : 'Black') + ' wins!');
    else if (s === 'stalemate') setStatus('Stalemate!');
    else if (s === 'check') setStatus('Check!');
    else setStatus('playing');
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
      aiTimeout.current = setTimeout(() => {
        const b = boardRef.current;
        const move = bestMove(b, 'black');
        if (move) {
          doMoveRef.current(move.fr, move.fc, move.tr, move.tc);
        }
        setThinking(false);
      }, 300);
    }
    return () => {
      if (aiTimeout.current) clearTimeout(aiTimeout.current);
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
  };

  const isDark = (r: number, c: number) => (r + c) % 2 === 1;

  return (
    <div className="h-full w-full bg-zinc-900 text-white overflow-y-auto">
      <div className="p-4 md:p-6 flex flex-col items-center">
        <div className="flex items-center justify-between w-full max-w-2xl mb-4">
          <button onClick={onBack} className="flex items-center gap-1 px-3 py-1.5 hover:bg-white/10 rounded-lg text-xs transition">
            <ArrowLeft01Icon size={14} /> Back
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

        <div className="grid grid-cols-8 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          {board.flat().map((piece, i) => {
            const r = Math.floor(i / 8);
            const c = i % 8;
            const isSelected = selected?.[0] === r && selected?.[1] === c;
            const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c);
            return (
              <div
                key={i}
                onClick={() => handleSquareClick(r, c)}
                className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-3xl md:text-4xl cursor-pointer transition-colors relative select-none
                  ${isDark(r, c) ? 'bg-emerald-800/60' : 'bg-stone-200/10'}
                  ${isSelected ? 'ring-2 ring-yellow-400 ring-inset' : ''}
                `}
              >
                {isValid && (
                  <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
                    {piece ? (
                      <div className="w-full h-full ring-2 ring-red-500/60 ring-inset rounded-full" />
                    ) : (
                      <div className={`w-3 h-3 rounded-full ${isDark(r, c) ? 'bg-white/30' : 'bg-black/20'}`} />
                    )}
                  </div>
                )}
                {piece && <span className="drop-shadow-lg">{PIECE_UNICODE[piece.color][piece.type]}</span>}
              </div>
            );
          })}
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
