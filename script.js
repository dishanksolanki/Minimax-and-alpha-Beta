<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tic-Tac-Toe AI — Minimax & Alpha-Beta Pruning</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="gx" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff63a9"/><stop offset="1" stop-color="#ff7a45"/></linearGradient>
<linearGradient id="go" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3d7cff"/><stop offset="1" stop-color="#12cfff"/></linearGradient></defs></svg>

<header class="site-header" id="hdr">
  <a class="brand" href="#home" aria-label="NEUROPLAY home">
    <svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><path d="M12 4v24M20 4v24M4 12h24M4 20h24" stroke="#c5c0ee" stroke-width="1.6" stroke-linecap="round"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="url(#gx)" stroke-width="2.2" stroke-linecap="round"/><circle cx="16" cy="16" r="3" stroke="url(#go)" stroke-width="2.2" fill="none"/></svg>
    <span><strong>NEUROPLAY</strong><small>AI game lab</small></span>
  </a>
  <button class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="nav" aria-label="Toggle menu"><span></span><span></span></button>
  <nav id="nav" class="nav"><a href="#home">Home</a><a href="#play">Play Game</a><a href="#how">How It Works</a><a href="#about">About AI</a></nav>
</header>

<main>
<section id="home" class="hero">
  <div class="hero-text">
    <p class="badge"><i></i>Artificial intelligence project</p>
    <h1>Outsmart the AI.<em>Or try to.</em></h1>
    <p class="lead">Experience intelligent game playing powered by Minimax and Alpha-Beta Pruning. Every move is calculated. Every decision has a strategy.</p>
    <div class="btn-row"><a class="btn primary" href="#play">Play Against AI</a><a class="btn ghost" href="#how">Explore the Algorithm</a></div>
    <ul class="features"><li>Intelligent Decision Making</li><li>Real-Time Strategy</li><li>Alpha-Beta Optimization</li></ul>
  </div>
  <div class="hero-art" aria-hidden="true">
    <div class="tag t1"><small>AI status</small><b>Ready to Think</b></div>
    <div class="pwrap"><div class="preview" id="preview"></div>
      <svg class="strike" viewBox="0 0 300 300"><line class="on wo" pathLength="1" x1="284" y1="16" x2="16" y2="284"/></svg></div>
    <div class="tag t2"><small>Algorithm</small><b>Minimax + Alpha-Beta</b></div>
  </div>
</section>

<section id="play" class="section">
  <h2>Challenge the Machine</h2>
  <p class="sub">Make your move. The AI is already thinking ahead.</p>
  <div class="game-layout">
    <div class="board-box panel">
      <div class="turn" id="turnLabel" aria-live="polite">YOUR TURN</div>
      <div class="stage">
        <div class="board" id="board" role="grid" aria-label="Tic-Tac-Toe board"></div>
        <svg class="strike" viewBox="0 0 300 300" aria-hidden="true"><line id="strike" pathLength="1" x1="0" y1="0" x2="0" y2="0"/></svg>
      </div>
      <p class="status" id="status" role="status" aria-live="polite"></p>
      <div class="result" id="result" hidden><b id="resTitle"></b><p id="resMsg"></p><button class="btn primary" id="again">Play again</button></div>
    </div>
    <aside class="side panel">
      <section>
        <h3>Players</h3>
        <div class="players">
          <div class="pl" id="plHuman"><span class="mark x">X</span><div><b>You</b><small>Human player</small></div><i class="dot"></i></div>
          <div class="pl" id="plAI"><span class="mark o">O</span><div><b>AI</b><small>Opponent</small></div><i class="dot"></i></div>
        </div>
      </section>
      <section>
        <h3>Difficulty</h3>
        <div class="seg" id="seg" role="radiogroup" aria-label="Difficulty"><span class="thumb"></span>
          <button role="radio" aria-checked="false" data-d="easy">Easy</button>
          <button role="radio" aria-checked="false" data-d="medium">Medium</button>
          <button role="radio" aria-checked="true" data-d="unbeatable" class="on">Unbeatable</button>
        </div>
        <p class="hint" id="diffHint"></p>
      </section>
      <section>
        <h3>Scoreboard</h3>
        <div class="scores">
          <div><b id="sPlayer" class="cx">0</b><small>Player Wins</small></div>
          <div><b id="sAI" class="cp">0</b><small>AI Wins</small></div>
          <div><b id="sDraw">0</b><small>Draws</small></div>
        </div>
        <div class="btn-row tight"><button class="btn primary" id="newGame">New Game</button><button class="btn ghost" id="resetScore">Reset Score</button></div>
      </section>
    </aside>
  </div>
</section>

<section id="mind" class="section">
  <h2>Inside the AI's Mind</h2>
  <p class="sub">Explore the logic behind every decision.</p>
  <div class="readout">
    <div class="metric wide"><small>Algorithm</small><b>Minimax + Alpha-Beta Pruning</b></div>
    <div class="metric"><small>Nodes Evaluated</small><b id="mNodes">—</b></div>
    <div class="metric"><small>Branches Pruned</small><b id="mPruned">—</b></div>
    <div class="metric"><small>Search Depth</small><b id="mDepth">—</b></div>
    <div class="metric"><small>Selected Move</small><b id="mMove">—</b></div>
    <div class="metric"><small>Minimax Score</small><b id="mScore">—</b></div>
  </div>
  <p class="empty" id="mEmpty">Search statistics will appear after the AI evaluates the board.</p>
  <button class="btn primary" id="explainBtn" disabled>Explore AI Decision</button>
</section>

<dialog id="modal" aria-labelledby="mTitle">
  <div class="modal-in"><h3 id="mTitle">Latest AI decision</h3><div id="mBody"></div><button class="btn ghost" id="closeModal">Close</button></div>
</dialog>

<section id="how" class="section">
  <h2>How the AI Thinks</h2>
  <div class="steps">
    <article class="step"><span class="ico"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 8l-6 9M12 8l6 9"/></svg></span><span class="num">01</span><h3>Explore</h3><p>The algorithm examines possible future moves.</p></article>
    <article class="step"><span class="ico"><svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg></span><span class="num">02</span><h3>Evaluate</h3><p>Minimax determines the outcome of possible game states.</p></article>
    <article class="step"><span class="ico"><svg viewBox="0 0 24 24"><path d="M4 20L20 4M14 4h6v6"/></svg></span><span class="num">03</span><h3>Optimize</h3><p>Alpha-Beta Pruning skips branches that cannot change the optimal decision.</p></article>
  </div>
  <div class="tree-box panel">
    <h3>Illustrative example <small>A fixed demo tree, not live game data</small></h3>
    <svg id="tree" viewBox="0 0 500 270" role="img" aria-label="Alpha-beta pruning example tree">
      <g class="edges"><line x1="250" y1="55" x2="130" y2="120"/><line x1="250" y1="55" x2="370" y2="120"/><line x1="130" y1="150" x2="70" y2="215"/><line x1="130" y1="150" x2="190" y2="215"/><line x1="370" y1="150" x2="310" y2="215"/><line class="e4" x1="370" y1="150" x2="430" y2="215"/></g>
      <g class="nd"><rect x="190" y="25" width="120" height="32" rx="10"/><text id="tR" x="250" y="46"></text></g>
      <g class="nd"><rect x="70" y="120" width="120" height="32" rx="10"/><text id="tA" x="130" y="141"></text></g>
      <g class="nd"><rect x="310" y="120" width="120" height="32" rx="10"/><text id="tB" x="370" y="141"></text></g>
      <g class="lf" id="l0"><rect x="45" y="215" width="50" height="30" rx="15"/><text x="70" y="235">3</text></g>
      <g class="lf" id="l1"><rect x="165" y="215" width="50" height="30" rx="15"/><text x="190" y="235">5</text></g>
      <g class="lf" id="l2"><rect x="285" y="215" width="50" height="30" rx="15"/><text x="310" y="235">2</text></g>
      <g class="lf" id="l3"><rect x="405" y="215" width="50" height="30" rx="15"/><text x="430" y="235">9</text></g>
    </svg>
    <p class="caption" id="treeCap" aria-live="polite"></p>
    <div class="btn-row tight center"><button class="btn ghost" id="treePrev">Back</button><button class="btn primary" id="treeNext">Next step</button></div>
  </div>
</section>

<section id="about" class="section">
  <h2>Understanding the Intelligence</h2>
  <dl class="about-grid">
    <div><dt>What is Minimax?</dt><dd>A decision-making algorithm for two-player games. It assumes both players play their best and picks the move with the best guaranteed result.</dd></div>
    <div><dt>What is MAX?</dt><dd>The player (the AI) that tries to maximize the evaluation score.</dd></div>
    <div><dt>What is MIN?</dt><dd>The player (the human) that tries to minimize the evaluation score.</dd></div>
    <div><dt>What is Alpha?</dt><dd>The best value MAX can guarantee so far along the current path.</dd></div>
    <div><dt>What is Beta?</dt><dd>The best value MIN can guarantee so far along the current path.</dd></div>
    <div><dt>What is Alpha-Beta Pruning?</dt><dd>An optimization that stops exploring a branch once it can no longer change the final decision. It gives the same answer as Minimax with less work.</dd></div>
    <div><dt>Pruning condition</dt><dd><code>alpha &gt;= beta</code></dd></div>
    <div><dt>Time complexity</dt><dd>Plain Minimax: <code>O(b^d)</code>. Alpha-Beta in the best case with favorable move ordering: <code>O(b^(d/2))</code>. The real number of nodes explored depends on the board position and move ordering.</dd></div>
  </dl>
</section>
</main>

<footer class="footer">
  <div><strong>NEUROPLAY</strong><p>Built to demonstrate intelligent game playing.</p></div>
  <nav><a href="#play">Play Game</a><a href="#how">How It Works</a><a href="#about">About AI</a></nav>
  <small>HTML • CSS • JavaScript</small>
</footer>
<script src="script.js"></script>
</body>
</html>
