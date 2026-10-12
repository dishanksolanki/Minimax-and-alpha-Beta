"use strict";
/* ===== Constants & state ===== */
const HUMAN = "X", AI = "O";
const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const HINTS = {
  easy: "The AI chooses mostly random legal moves.",
  medium: "The AI uses a limited-depth Minimax search (depth 2) with Alpha-Beta Pruning.",
  unbeatable: "The AI uses full-depth Minimax with Alpha-Beta Pruning and optimal play."
};
let board, gameOver, aiBusy, aiTimer, lastMove, difficulty = "unbeatable";
let scores = { player: 0, ai: 0, draw: 0 };
let stats = null;        // live counters for the CURRENT search (reset every search)
let lastSearch = null;   // result of the latest AI search, used by the modal
const $ = id => document.getElementById(id);
// X and O are drawn as SVG strokes (pathLength=1 lets the CSS "draw" animation trace them)
const MARK = {
  X: '<svg class="m" viewBox="0 0 100 100"><path pathLength="1" d="M22 22L78 78M78 22L22 78"/></svg>',
  O: '<svg class="m" viewBox="0 0 100 100"><circle pathLength="1" cx="50" cy="50" r="29"/></svg>'
};
function buildPreview() {   // decorative hero board (separate from the playable one)
  const demo = ["X","X","O",null,"O","X","O",null,null];
  $("preview").innerHTML = demo.map((v, i) =>
    `<div class="${v ? v.toLowerCase() : ""}${[2,4,6].includes(i) ? " win" : ""}">${v ? MARK[v] : ""}</div>`).join("");
}

/* ===== Game-state helpers ===== */
// Returns {winner:'X'|'O'|'draw', line} when the game is over, otherwise null.
function checkWinner(b) {
  for (const line of WIN_LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { winner: b[a], line };
  }
  return b.includes(null) ? null : { winner: "draw", line: [] };
}
function getAvailableMoves(b) {
  const moves = [];
  b.forEach((v, i) => { if (v === null) moves.push(i); });
  return moves;
}
// Terminal evaluation from the AI's (MAX) point of view. Depth is subtracted so
// the AI prefers faster wins and delays inevitable losses. Returns null if not terminal.
function evaluateBoard(b, depth) {
  const result = checkWinner(b);
  if (!result) return null;
  if (result.winner === AI) return 10 - depth;
  if (result.winner === HUMAN) return depth - 10;
  return 0;
}

/* ===== MINIMAX WITH ALPHA-BETA PRUNING ===== */
// isMaximizing=true -> AI's turn (MAX), false -> human's turn (MIN).
// alpha = best value MAX can already guarantee; beta = best value MIN can already guarantee.
function minimax(b, depth, isMaximizing, alpha, beta, maxDepth) {
  stats.nodes++;
  stats.maxDepth = Math.max(stats.maxDepth, depth);
  const terminal = evaluateBoard(b, depth);
  if (terminal !== null) return terminal;
  if (depth >= maxDepth) return 0;            // depth limit (Easy/Medium): neutral estimate

  const moves = getAvailableMoves(b);
  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      b[moves[i]] = AI;
      best = Math.max(best, minimax(b, depth + 1, false, alpha, beta, maxDepth));
      b[moves[i]] = null;
      alpha = Math.max(alpha, best);          // alpha updates ONLY at MAX nodes
      if (alpha >= beta) {                    // >>> PRUNING HAPPENS HERE <<<
        stats.pruned += moves.length - 1 - i; // remaining siblings are skipped
        stats.pruneEvents++;
        break;
      }
    }
    return best;
  }
  let best = Infinity;
  for (let i = 0; i < moves.length; i++) {
    b[moves[i]] = HUMAN;
    best = Math.min(best, minimax(b, depth + 1, true, alpha, beta, maxDepth));
    b[moves[i]] = null;
    beta = Math.min(beta, best);              // beta updates ONLY at MIN nodes
    if (alpha >= beta) {                      // >>> PRUNING HAPPENS HERE <<<
      stats.pruned += moves.length - 1 - i;
      stats.pruneEvents++;
      break;
    }
  }
  return best;
}

// Root of the search: tries every AI move, records real candidate data, returns the best one.
function getBestMove(b, maxDepth) {
  stats = { nodes: 0, pruned: 0, pruneEvents: 0, maxDepth: 0 };
  const candidates = [];
  let alpha = -Infinity, beta = Infinity, bestScore = -Infinity, bestMove = null;
  for (const move of getAvailableMoves(b)) {
    const nodesBefore = stats.nodes, prunedBefore = stats.pruned, alphaIn = alpha;
    b[move] = AI;
    const score = minimax(b, 1, false, alpha, beta, maxDepth);
    b[move] = null;
    // After the first move, a score <= alpha is only an upper bound (the subtree was cut short).
    candidates.push({ move, score, alphaIn, beta, exact: candidates.length === 0 || score > alphaIn,
      nodes: stats.nodes - nodesBefore, pruned: stats.pruned - prunedBefore });
    if (score > bestScore) { bestScore = score; bestMove = move; }
    alpha = Math.max(alpha, bestScore);
  }
  stats.nodes++;                                // count the root node itself
  lastSearch = { move: bestMove, score: bestScore, candidates, maxDepth, ...stats };
  return bestMove;
}

function chooseAIMove() {
  const free = getAvailableMoves(board);
  const random = () => free[Math.floor(Math.random() * free.length)];
  if (difficulty === "easy" && Math.random() < 0.8) {
    lastSearch = { random: true, move: random() };
    return lastSearch.move;
  }
  return getBestMove(board, difficulty === "unbeatable" ? 9 : 2);
}

/* ===== UI ===== */
function buildBoard() {
  const el = $("board"); el.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const c = document.createElement("button");
    c.className = "cell"; c.dataset.i = i; c.setAttribute("role", "gridcell");
    c.addEventListener("click", () => humanMove(i));
    el.appendChild(c);
  }
}
function render() {
  document.querySelectorAll(".cell").forEach((c, i) => {
    const v = board[i];
    c.className = "cell" + (v ? " " + v.toLowerCase() : "") + (i === lastMove ? " last" : "");
    if ((c.dataset.v || "") !== (v || "")) { c.innerHTML = v ? MARK[v] : ""; c.dataset.v = v || ""; }
    c.disabled = !!v || gameOver || aiBusy;
    c.setAttribute("aria-label", `Row ${Math.floor(i/3)+1}, column ${i%3+1}, ${v || "empty"}`);
  });
}
function setTurn(isAI) {
  const t = $("turnLabel");
  t.textContent = isAI ? "AI'S TURN" : "YOUR TURN"; t.classList.toggle("ai", isAI);
  $("plHuman").classList.toggle("active", !isAI); $("plAI").classList.toggle("active", isAI);
}
const say = msg => { $("status").textContent = msg; };
function updateScores() {
  $("sPlayer").textContent = scores.player; $("sAI").textContent = scores.ai; $("sDraw").textContent = scores.draw;
}

function humanMove(i) {
  if (gameOver || aiBusy || board[i]) return;
  board[i] = HUMAN; lastMove = i;
  if (finishIfOver()) return;
  aiBusy = true; setTurn(true); say("The AI is calculating its next move...");
  render();
  aiTimer = setTimeout(aiMove, 500);
}
function aiMove() {
  const move = chooseAIMove();
  board[move] = AI; lastMove = move; aiBusy = false;
  showStats();
  if (!finishIfOver()) { setTurn(false); say("Your turn. Pick an empty cell."); render(); }
}
function finishIfOver() {
  const r = checkWinner(board);
  if (!r) { render(); return false; }
  gameOver = true; aiBusy = false; render();
  r.line.forEach(i => document.querySelectorAll(".cell")[i].classList.add("win"));
  if (r.winner === HUMAN) { scores.player++; say("Victory! You outsmarted the AI."); }
  else if (r.winner === AI) { scores.ai++; say("AI Wins! Better luck next time."); }
  else { scores.draw++; say("It's a Draw!"); }
  updateScores(); setTurn(false); $("turnLabel").textContent = "GAME OVER";
  return true;
}
function newGame() {
  clearTimeout(aiTimer);
  board = Array(9).fill(null); gameOver = false; aiBusy = false; lastMove = null;
  setTurn(false); say("Make your move. You play X."); render();
}

/* ===== Dashboard + decision explanation ===== */
function showStats() {
  $("explainBtn").disabled = false; $("mEmpty").hidden = true;
  const s = lastSearch, rc = i => `Row ${Math.floor(i/3)+1}, Col ${i%3+1}`;
  $("mMove").textContent = rc(s.move);
  if (s.random) {
    ["mNodes","mPruned","mDepth","mScore"].forEach(id => $(id).textContent = "N/A");
    return;
  }
  $("mNodes").textContent = s.nodes; $("mPruned").textContent = s.pruned;
  $("mDepth").textContent = s.maxDepth; $("mScore").textContent = s.score;
}
function explain() {
  const s = lastSearch, rc = i => `R${Math.floor(i/3)+1} C${i%3+1}`;
  let html;
  if (s.random) {
    html = `<p>On ${difficulty} difficulty this move was chosen <b>randomly</b> (${rc(s.move)}), so no Minimax search ran and there are no scores or pruning data.</p>`;
  } else {
    const rows = s.candidates.map(c => `<tr class="${c.move === s.move ? "pick" : ""}"><td>${rc(c.move)}</td>
      <td>${c.exact ? "" : "≤ "}${c.score}</td><td>${c.alphaIn === -Infinity ? "-∞" : c.alphaIn}</td><td>${c.beta === Infinity ? "+∞" : c.beta}</td><td>${c.nodes}</td><td>${c.pruned}</td></tr>`).join("");
    const prune = s.pruneEvents > 0
      ? `Pruning occurred ${s.pruneEvents} time(s) (alpha ≥ beta), skipping ${s.pruned} child branch(es) that could not change the decision.`
      : `No pruning occurred during this particular search.`;
    html = `<p>Searched to depth ${s.maxDepth} · ${s.nodes} nodes evaluated. Selected <b>${rc(s.move)}</b> with score <b>${s.score}</b>.</p>
      <table><thead><tr><th>Candidate</th><th>Score</th><th>Alpha in</th><th>Beta in</th><th>Nodes</th><th>Pruned</th></tr></thead><tbody>${rows}</tbody></table>
      <p>"≤" marks a score that is only an upper bound because that branch was cut short by pruning; it is already known to be no better than the best move so far. ${prune}</p>`;
  }
  $("mBody").innerHTML = html; $("modal").showModal();
}

/* ===== Illustrative tree (fixed example, not live data) ===== */
const TREE = [
  { t: "MAX root starts with α = -∞, β = +∞. It will pick the larger of its two MIN children.", R: "MAX α=-∞ β=+∞", A: "MIN", B: "MIN", seen: 0 },
  { t: "Left MIN node visits leaf 3: β = 3 (MIN keeps the smallest value seen).", R: "MAX α=-∞ β=+∞", A: "MIN β=3", B: "MIN", seen: 1 },
  { t: "Leaf 5 is not smaller, so the left MIN node's value is 3. The root now has α = 3.", R: "MAX α=3 β=+∞", A: "MIN = 3", B: "MIN", seen: 2 },
  { t: "Right MIN node inherits α = 3 and visits leaf 2: β = 2.", R: "MAX α=3 β=+∞", A: "MIN = 3", B: "MIN α=3 β=2", seen: 3 },
  { t: "α (3) ≥ β (2): PRUNE leaf 9. This MIN node is at most 2, so MAX would never choose it over 3. The root value is 3.", R: "MAX = 3", A: "MIN = 3", B: "MIN ≤ 2 ✂", seen: 3, cut: true }
];
let treeStep = 0;
function drawTree() {
  const s = TREE[treeStep];
  $("tR").textContent = s.R; $("tA").textContent = s.A; $("tB").textContent = s.B;
  for (let i = 0; i < 4; i++) {
    const l = $("l" + i);
    l.classList.toggle("seen", i < s.seen);
    l.classList.toggle("pruned", !!s.cut && i === 3);
  }
  document.querySelector(".e4").classList.toggle("cut", !!s.cut);
  $("treeCap").textContent = `Step ${treeStep + 1} of ${TREE.length}: ${s.t}`;
  $("treePrev").disabled = treeStep === 0; $("treeNext").disabled = treeStep === TREE.length - 1;
}

/* ===== Wiring ===== */
document.querySelectorAll(".seg button").forEach(b => b.addEventListener("click", () => {
  difficulty = b.dataset.d;
  document.querySelectorAll(".seg button").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); });
  $("diffHint").textContent = HINTS[difficulty];
  newGame();                                   // changing difficulty starts a fresh round (scores kept)
}));
$("newGame").addEventListener("click", newGame);
let resetArmed = false, resetTimer;
$("resetScore").addEventListener("click", e => {  // two-click confirmation, no popup
  if (!resetArmed) { resetArmed = true; e.target.textContent = "Click again to confirm";
    resetTimer = setTimeout(() => { resetArmed = false; e.target.textContent = "Reset Score"; }, 3000); return; }
  clearTimeout(resetTimer); resetArmed = false; e.target.textContent = "Reset Score";
  scores = { player: 0, ai: 0, draw: 0 }; updateScores();
});
$("explainBtn").addEventListener("click", explain);
$("closeModal").addEventListener("click", () => $("modal").close());
$("treePrev").addEventListener("click", () => { treeStep--; drawTree(); });
$("treeNext").addEventListener("click", () => { treeStep++; drawTree(); });
$("menuBtn").addEventListener("click", () => {
  const open = $("nav").classList.toggle("open"); $("menuBtn").setAttribute("aria-expanded", open);
});
$("nav").addEventListener("click", () => { $("nav").classList.remove("open"); $("menuBtn").setAttribute("aria-expanded", false); });

buildPreview(); buildBoard(); newGame(); updateScores(); drawTree(); $("diffHint").textContent = HINTS[difficulty];
