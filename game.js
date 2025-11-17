(() => {
"use strict";

// ==== 手感相关可调常量 ======================================
// 角度单位使用“弧度”，以「屏幕水平向右」为 0，顺时针为正方向。
// 想整体改变手感，就改这几个值就行：

const TANK_MOVE_SPEED   = 100;               // 坦克基础移动速度（像素/秒，偏慢一点方便走位）
const TANK_ROTATE_SPEED = Math.PI;           // 坦克转向角速度（弧度/秒，这里约等于 180°/秒）
const BULLET_SPEED      = 160;               // 子弹速度（像素/秒，比坦克快但不会“秒飞”）

// 简单调参建议：
// - 想坦克更灵活：提高 TANK_MOVE_SPEED 和 TANK_ROTATE_SPEED；
// - 想子弹更压迫：提高 BULLET_SPEED；
// - 想整体慢一点：统一把这几个值都往下调一点。

  const CONFIG = {
    canvasWidth: 960,
    canvasHeight: 640,
    mapPadding: 40,
    mazeCols: 10,                 // 横向格子数，越少每格越大，整体更开阔
    mazeRows: 7,                  // 纵向格子数
    mazeWallThickness: 6,        // 墙体厚度（像素）
    mazeExtraConnectionChance: 0.25,  // 额外随机打通墙的概率，越大越开阔
    mazeDeadEndTrimChance: 0.65,      // “削减死胡同”的概率，越大死角越少


tankRadius: 18,
  tankSpeedByDifficulty: {
    easy:   TANK_MOVE_SPEED * 0.8,
    normal: TANK_MOVE_SPEED * 1.0,
    hard:   TANK_MOVE_SPEED * 1.1,
  },

  // 子弹速度只用一个基准常量
  bulletSpeed: BULLET_SPEED,
    aiSpeedFactor: {
    easy:   0.8,   // 比玩家慢一点
    normal: 1.0,   // 和玩家差不多
    hard:   1.1,   // 比玩家略快，给点压迫感
  },

    bulletRadius: 4,
    bulletMaxBounces: 100,
    bulletLifeTime: 10,
    maxBulletsPerTank: 5,

    scoreTarget: 7,
    timeLimit: 180, // 5 分钟

    navGridCellSize: 28,
    playerShootInterval: 0.28,
  };

  const DIFFICULTY_PARAMS = {
    easy: {
      fireIntervalMin: 1.2,
      fireIntervalMax: 1.8,
      predictionFactor: 0.5,
      aimErrorDeg: 25,
      reactionDelay: 0.35,
    },
    normal: {
      fireIntervalMin: 0.9,
      fireIntervalMax: 1.4,
      predictionFactor: 0.8,
      aimErrorDeg: 15,
      reactionDelay: 0.25,
    },
    hard: {
      fireIntervalMin: 0.6,
      fireIntervalMax: 1.0,
      predictionFactor: 1.0,
      aimErrorDeg: 8,
      reactionDelay: 0.18,
    },
  };

  const GameMode = {
    SCORE: "score",
    TIME: "time",
  };

  // ===== DOM 引用 =====
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const menuEl = document.getElementById("menu");
  const hudEl = document.getElementById("hud");
  const overlayEl = document.getElementById("game-over");

  const difficultySelect = document.getElementById("difficultySelect");
  const modeSelect = document.getElementById("modeSelect");
  const startBtn = document.getElementById("startBtn");
  const muteBtn = document.getElementById("muteBtn");

  const playerScoreEl = document.getElementById("playerScore");
  const aiScoreEl = document.getElementById("aiScore");
  const timerEl = document.getElementById("timer");
  const modeLabelEl = document.getElementById("modeLabel");
  const difficultyLabelEl = document.getElementById("difficultyLabel");

  const pauseBtn = document.getElementById("pauseBtn");
  const resumeBtn = document.getElementById("resumeBtn");
  const restartBtn = document.getElementById("restartBtn");

  const resultTextEl = document.getElementById("resultText");
  const finalScoreTextEl = document.getElementById("finalScoreText");
  const timeInfoEl = document.getElementById("timeInfo");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const backToMenuBtn = document.getElementById("backToMenuBtn");

  canvas.width = CONFIG.canvasWidth;
  canvas.height = CONFIG.canvasHeight;

  // ===== 输入状态 =====
  const input = {
    up: false,
    down: false,
    left: false,
    right: false,
    fire: false,
  };

  window.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        input.up = true;
        e.preventDefault();
        break;
      case "KeyS":
      case "ArrowDown":
        input.down = true;
        e.preventDefault();
        break;
      case "KeyA":
      case "ArrowLeft":
        input.left = true;
        e.preventDefault();
        break;
      case "KeyD":
      case "ArrowRight":
        input.right = true;
        e.preventDefault();
        break;
      case "Space":
        input.fire = true;
        e.preventDefault();
        break;
      case "KeyP":
        togglePause();
        e.preventDefault();
        break;
      case "Escape":
        if (gameState === "playing") {
          pauseGame();
          e.preventDefault();
        }
        break;
    }
  });

  window.addEventListener("keyup", (e) => {
    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        input.up = false;
        break;
      case "KeyS":
      case "ArrowDown":
        input.down = false;
        break;
      case "KeyA":
      case "ArrowLeft":
        input.left = false;
        break;
      case "KeyD":
      case "ArrowRight":
        input.right = false;
        break;
      case "Space":
        input.fire = false;
        break;
    }
  });

  // ===== 工具函数 =====
  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }
function getTankForwardVector(tank) {
  const dx = Math.cos(tank.angle);
  const dy = Math.sin(tank.angle);
  return { x: dx, y: dy };
}
  function clampInt(v, min, max) {
    v = Math.floor(v);
    if (v < min) return min;
    if (v > max) return max;
    return v;
  }

  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function rectsOverlap(a, b, padding = 0) {
    return !(
      a.x + a.w + padding <= b.x ||
      b.x + b.w + padding <= a.x ||
      a.y + a.h + padding <= b.y ||
      b.y + b.h + padding <= a.y
    );
  }

  function circleIntersectsRect(cx, cy, radius, rect) {
    const closestX = clamp(cx, rect.x, rect.x + rect.w);
    const closestY = clamp(cy, rect.y, rect.y + rect.h);
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy < radius * radius;
  }

  function formatTime(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  }

  function segmentIntersectsRect(x1, y1, x2, y2, rect) {
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      if (
        x >= rect.x &&
        x <= rect.x + rect.w &&
        y >= rect.y &&
        y <= rect.y + rect.h
      ) {
        return true;
      }
    }
    return false;
  }
  // 炮管与矩形墙体的碰撞检测
  // 思路：把炮管近似为从坦克中心指向前方的一条线段，
  // 长度取“子弹出生距离”，这样只要炮管能打出子弹，就不会穿墙。
  function tankGunIntersectsRect(tank, rect) {
    const forward = getTankForwardVector(tank);

    // 与 spawnBulletFromTank 中的 spawnOffset 保持一致：
    //   spawnOffset = tank.radius + CONFIG.bulletRadius + 4
    // 这样可以保证：只要这条线段已经插进墙里，就说明视觉上炮管也已经穿进去了。
    const gunLength = tank.radius + CONFIG.bulletRadius + 4;

    const x1 = tank.x;
    const y1 = tank.y;
    const x2 = tank.x + forward.x * gunLength;
    const y2 = tank.y + forward.y * gunLength;

    return segmentIntersectsRect(x1, y1, x2, y2, rect);
  }

  // ===== 声音管理 =====
  const SoundManager = {
    enabled: true,
    ctx: null,
    init() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    },
    resume() {
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    },
    play(freq, duration, type = "square", volume = 0.12) {
      if (!this.enabled || !this.ctx) return;
      try {
        const ctx = this.ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = volume;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        osc.start(now);
        gain.gain.setTargetAtTime(0, now + duration * 0.6, 0.05);
        osc.stop(now + duration);
      } catch {
        // 忽略音频异常
      }
    },
    shoot() {
      this.play(520, 0.08, "square", 0.12);
    },
    hit() {
      this.play(220, 0.13, "sawtooth", 0.16);
    },
    win() {
      this.play(880, 0.25, "triangle", 0.18);
    },
    lose() {
      this.play(160, 0.3, "sine", 0.2);
    },
    bounce() {
      this.play(340, 0.06, "square", 0.09);
    },
  };

  function updateMuteButton() {
    muteBtn.textContent = SoundManager.enabled ? "🔊 声音：开" : "🔇 声音：关";
  }

  muteBtn.addEventListener("click", () => {
    SoundManager.enabled = !SoundManager.enabled;
    SoundManager.init();
    SoundManager.resume();
    updateMuteButton();
  });

  updateMuteButton();

  // ===== 游戏状态 =====
  let gameState = "menu"; // menu / playing / paused / gameOver
  let currentMode = GameMode.SCORE;
  let currentDifficulty = "hard";

  let obstacles = [];
  let bullets = [];
  let playerTank = null;
  let aiTank = null;
  let maze = null;
  let playerSpawnPoint = null;
  let aiSpawnPoint = null;
  let playerScore = 0;
  let aiScore = 0;
  let remainingTime = CONFIG.timeLimit;

  let navGrid = null;
  let roundIndex = 0;
  let isRoundActive = false;
  let pendingRoundResult = null; // null / "playerWin" / "aiWin" / "draw"
  let roundJudgeTimer = 0;
  const SPAWN_RECT_PLAYER = {
    x: CONFIG.mapPadding,
    y: CONFIG.canvasHeight - CONFIG.mapPadding - 180,
    w: 260,
    h: 160,
  };

  const SPAWN_RECT_AI = {
    x: CONFIG.canvasWidth - CONFIG.mapPadding - 260,
    y: CONFIG.mapPadding,
    w: 260,
    h: 160,
  };
    // ===== 导航网格（给 AI 绕路用） =====
  // ===== 导航网格（给 AI 绕路用） =====
  function buildNavGrid() {
    // 如果已经生成了迷宫，就尽量让导航网格的粒度和迷宫接近；
    // 没有迷宫（理论上不会发生）就退回默认 cellSize。
    const baseCellSize = CONFIG.navGridCellSize;
    const cellSize =
      maze && maze.cellSize
        ? Math.min(baseCellSize, maze.cellSize * 0.8)
        : baseCellSize;

    const cols = Math.floor(CONFIG.canvasWidth / cellSize);
    const rows = Math.floor(CONFIG.canvasHeight / cellSize);
    const cells = [];

    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        // 这个格子的“中心点”在世界坐标中的位置
        const cx = x * cellSize + cellSize / 2;
        const cy = y * cellSize + cellSize / 2;

        // ★ 核心改变：
        // 以前用的是矩形 + padding 判断，导致走廊两边整条都被判成阻塞，
        // AI 在导航网格眼里几乎“哪儿都走不了”，于是就直接朝你硬撞墙。
        //
        // 现在改成：用“坦克圆 + 墙矩形”的碰撞来判断这个格子是否可走。
        // 可以理解为：如果把坦克的圆心放在这个格子中心会撞墙，那这个格子就是 1（阻塞），
        // 否则就是 0（可行走）。
        let blocked = false;
        for (const o of obstacles) {
          if (circleIntersectsRect(cx, cy, CONFIG.tankRadius, o)) {
            blocked = true;
            break;
          }
        }
        row.push(blocked ? 1 : 0);
      }
      cells.push(row);
    }

    navGrid = { cols, rows, cellSize, cells };
  }

  function worldToCell(x, y) {
    if (!navGrid) return { cx: 0, cy: 0 };

    const size = navGrid.cellSize;
    let cx = Math.floor(x / size);
    let cy = Math.floor(y / size);
    cx = clampInt(cx, 0, navGrid.cols - 1);
    cy = clampInt(cy, 0, navGrid.rows - 1);

    const cols = navGrid.cols;
    const rows = navGrid.rows;
    const cells = navGrid.cells;

    // 如果正好落在“阻塞格子”里（比如紧贴墙出生），
    // 在附近小范围内找一个最近的可走格子，把 AI 的起点/终点“吸附”过去。
    if (cells[cy][cx] === 0) {
      return { cx, cy };
    }

    const maxRadius = 4; // 搜索半径（单位：格）

    let best = null;
    let bestDist2 = Infinity;

    for (let r = 1; r <= maxRadius; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          if (cells[ny][nx] !== 0) continue;
          const d2 = dx * dx + dy * dy;
          if (d2 < bestDist2) {
            bestDist2 = d2;
            best = { cx: nx, cy: ny };
          }
        }
      }
      // 一旦在当前半径找到可走格子就立刻返回，避免不必要的更大范围搜索
      if (best) {
        return best;
      }
    }

    // 实在找不到（极端情况）就退回原来的格子
    return { cx, cy };
  }


  function findPath(startCell, goalCell) {
    if (!navGrid) return [];
    const cols = navGrid.cols;
    const rows = navGrid.rows;
    const cells = navGrid.cells;
    const key = (x, y) => `${x},${y}`;
    const heuristic = (x, y) =>
      Math.abs(x - goalCell.cx) + Math.abs(y - goalCell.cy);

    const open = [];
    const closed = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    const startKey = key(startCell.cx, startCell.cy);
    gScore.set(startKey, 0);
    fScore.set(startKey, heuristic(startCell.cx, startCell.cy));
    open.push({ x: startCell.cx, y: startCell.cy });

    while (open.length > 0) {
      let bestIndex = 0;
      let current = open[0];
      let currentKey = key(current.x, current.y);
      let bestF = fScore.get(currentKey) ?? Infinity;

      for (let i = 1; i < open.length; i++) {
        const n = open[i];
        const k = key(n.x, n.y);
        const f = fScore.get(k) ?? Infinity;
        if (f < bestF) {
          bestF = f;
          bestIndex = i;
          current = n;
          currentKey = k;
        }
      }

      open.splice(bestIndex, 1);

      if (current.x === goalCell.cx && current.y === goalCell.cy) {
        const pathCells = [];
        let ck = currentKey;
        let node = current;
        pathCells.push(node);
        while (cameFrom.has(ck)) {
          const prev = cameFrom.get(ck);
          ck = key(prev.x, prev.y);
          node = prev;
          pathCells.push(prev);
        }
        pathCells.reverse();
        const points = [];
        for (let i = 1; i < pathCells.length; i++) {
          const c = pathCells[i];
          points.push({
            x: c.x * navGrid.cellSize + navGrid.cellSize / 2,
            y: c.y * navGrid.cellSize + navGrid.cellSize / 2,
          });
        }
        return points;
      }

      closed.add(currentKey);
      const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];

      for (const d of dirs) {
        const nx = current.x + d[0];
        const ny = current.y + d[1];
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        if (cells[ny][nx] === 1) continue;
        const nKey = key(nx, ny);
        if (closed.has(nKey)) continue;
        const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1;
        const oldG = gScore.get(nKey);
        if (oldG === undefined || tentativeG < oldG) {
          cameFrom.set(nKey, { x: current.x, y: current.y });
          gScore.set(nKey, tentativeG);
          fScore.set(nKey, tentativeG + heuristic(nx, ny));
          if (!open.some((n) => n.x === nx && n.y === ny)) {
            open.push({ x: nx, y: ny });
          }
        }
      }
    }
    return [];
  }

  // ===== 地图生成：少量障碍 + 空旷操场 =====
   // ===== 迷宫地图生成：规则网格 + 随机打通 =====
  // 思路：
  // 1）把地图中间区域切成 mazeRows x mazeCols 的格子，每个格子是可通行的房间；
  // 2）一开始格子之间全部被墙隔开；
  // 3）用深度优先搜索（DFS）随机打通相邻格子之间的墙；
  //    => 保证所有格子最终都是连通的，不会有死牢；
  // 4）再额外随机打通一部分墙，让地图多一些环路和开阔区域；
  // 5）把所有“还存在的墙”转换成矩形障碍，给坦克和子弹做碰撞用。

    // ===== 迷宫地图生成：规则网格 + 随机打通 + 削减死胡同 =====
  // 思路：
  // 1）把地图中间区域切成 mazeRows x mazeCols 的格子，每个格子是可通行的房间；
  // 2）一开始格子之间全部被墙隔开；
  // 3）用 DFS 随机打通相邻格子之间的墙 => 得到一棵“迷宫生成树”，保证整体连通；
  // 4）额外随机打通一些墙 => 有环路、有开阔区，不是单路树；
  // 5）再对“只有一个出口的格子”（死胡同）做一轮修剪，随机再打通一面墙，
  //    把大部分死胡同变成两端通的走廊；
  // 6）剩下的墙全部转成矩形障碍，用于坦克/子弹碰撞。

  function generateMazeMap() {
    obstacles = [];

    const cols = CONFIG.mazeCols;
    const rows = CONFIG.mazeRows;
    const wallThickness = CONFIG.mazeWallThickness;

    const innerWidth = CONFIG.canvasWidth - CONFIG.mapPadding * 2;
    const innerHeight = CONFIG.canvasHeight - CONFIG.mapPadding * 2;

    const cellSizeX = innerWidth / cols;
    const cellSizeY = innerHeight / rows;
    const cellSize = Math.floor(Math.min(cellSizeX, cellSizeY));

    const mazeWidth = cellSize * cols;
    const mazeHeight = cellSize * rows;

    // 让迷宫整体尽量居中放在画布里
    const originX = (CONFIG.canvasWidth - mazeWidth) / 2;
    const originY = (CONFIG.canvasHeight - mazeHeight) / 2;

    const visited = Array.from({ length: rows }, () =>
      Array(cols).fill(false)
    );

    // verticalWalls[row][col]，col 范围 0..cols
    const verticalWalls = Array.from({ length: rows }, () =>
      Array(cols + 1).fill(true)
    );

    // horizontalWalls[row][col]，row 范围 0..rows
    const horizontalWalls = Array.from({ length: rows + 1 }, () =>
      Array(cols).fill(true)
    );

    // 深度优先：随机打通格子之间的墙，生成“骨架迷宫”
    function dfs(cx, cy) {
      visited[cy][cx] = true;

      const dirs = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 },
      ];
      // 打乱方向顺序，保证每局不一样
      for (let i = dirs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = dirs[i];
        dirs[i] = dirs[j];
        dirs[j] = tmp;
      }

      for (const d of dirs) {
        const nx = cx + d.dx;
        const ny = cy + d.dy;
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
        if (visited[ny][nx]) continue;

        // 打通当前格子和相邻格子之间的墙
        if (d.dx === 1) {
          verticalWalls[cy][cx + 1] = false; // 右墙
        } else if (d.dx === -1) {
          verticalWalls[cy][cx] = false;     // 左墙
        } else if (d.dy === 1) {
          horizontalWalls[cy + 1][cx] = false; // 下墙
        } else if (d.dy === -1) {
          horizontalWalls[cy][cx] = false;     // 上墙
        }

        dfs(nx, ny);
      }
    }

    const startX = Math.floor(Math.random() * cols);
    const startY = Math.floor(Math.random() * rows);
    dfs(startX, startY); // DFS 生成的迷宫天然保证“整图连通”

    // 额外随机打通部分墙，让迷宫不那么像“一棵树”
    const extraChance = CONFIG.mazeExtraConnectionChance;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (Math.random() < extraChance) {
          const horizontal = Math.random() < 0.5;
          if (horizontal && x < cols - 1) {
            // 打通右墙（内墙，外圈仍然保留）
            verticalWalls[y][x + 1] = false;
          } else if (!horizontal && y < rows - 1) {
            // 打通下墙
            horizontalWalls[y + 1][x] = false;
          }
        }
      }
    }

    // —— 削减死胡同：对“只有一个出口”的格子，再随机打通一面墙 ——
    const trimChance = CONFIG.mazeDeadEndTrimChance;

    function countOpenNeighborsAt(cx, cy) {
      let c = 0;
      if (cx > 0 && !verticalWalls[cy][cx]) c++; // 左
      if (cx < cols - 1 && !verticalWalls[cy][cx + 1]) c++; // 右
      if (cy > 0 && !horizontalWalls[cy][cx]) c++; // 上
      if (cy < rows - 1 && !horizontalWalls[cy + 1][cx]) c++; // 下
      return c;
    }

    function openExtraWallFromCell(cx, cy) {
      const candidates = [];

      // 注意这里只考虑“内墙”，不动最外圈边界墙
      if (cx > 0 && verticalWalls[cy][cx]) {
        candidates.push({ type: "V", side: "L" }); // 左墙
      }
      if (cx < cols - 1 && verticalWalls[cy][cx + 1]) {
        candidates.push({ type: "V", side: "R" }); // 右墙
      }
      if (cy > 0 && horizontalWalls[cy][cx]) {
        candidates.push({ type: "H", side: "U" }); // 上墙
      }
      if (cy < rows - 1 && horizontalWalls[cy + 1][cx]) {
        candidates.push({ type: "H", side: "D" }); // 下墙
      }

      if (candidates.length === 0) return false;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];

      if (pick.type === "V") {
        if (pick.side === "L") {
          verticalWalls[cy][cx] = false;
        } else {
          verticalWalls[cy][cx + 1] = false;
        }
      } else {
        if (pick.side === "U") {
          horizontalWalls[cy][cx] = false;
        } else {
          horizontalWalls[cy + 1][cx] = false;
        }
      }
      return true;
    }

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const openN = countOpenNeighborsAt(x, y);
        if (openN === 1 && Math.random() < trimChance) {
          // 只删除墙，不加墙，因此整体连通性不会被破坏
          openExtraWallFromCell(x, y);
        }
      }
    }

    // neighbors[y][x]：每个格子能走到哪些邻居格子（用于选出生点）
    const neighbors = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => [])
    );

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (x > 0 && !verticalWalls[y][x]) {
          neighbors[y][x].push({ x: x - 1, y });
        }
        if (x < cols - 1 && !verticalWalls[y][x + 1]) {
          neighbors[y][x].push({ x: x + 1, y });
        }
        if (y > 0 && !horizontalWalls[y][x]) {
          neighbors[y][x].push({ x, y: y - 1 });
        }
        if (y < rows - 1 && !horizontalWalls[y + 1][x]) {
          neighbors[y][x].push({ x, y: y + 1 });
        }
      }
    }

    // 把格子坐标转换成“走廊中心”的世界坐标
    function cellToWorldCenter(cx, cy) {
      return {
        x: originX + cx * cellSize + cellSize / 2,
        y: originY + cy * cellSize + cellSize / 2,
      };
    }

    // —— 出生点：只从“出口>=2 的格子”里选，且尽量相距较远 ——
    const candidates = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (neighbors[y][x].length >= 2) {
          candidates.push({ x, y });
        }
      }
    }

    let playerCell = { x: 0, y: 0 };
    let aiCell = { x: cols - 1, y: rows - 1 };

    if (candidates.length > 0) {
      // 玩家：大致“左上角”的一个格子（x+y 最小）
      playerCell = candidates.reduce((best, c) => {
        const bestScore = best.x + best.y;
        const score = c.x + c.y;
        return score < bestScore ? c : best;
      });

      // BFS 计算各格子距离
      const dist = Array.from({ length: rows }, () =>
        Array(cols).fill(Infinity)
      );
      const queue = [];
      dist[playerCell.y][playerCell.x] = 0;
      queue.push(playerCell);

      while (queue.length > 0) {
        const cur = queue.shift();
        const dcur = dist[cur.y][cur.x];
        for (const nb of neighbors[cur.y][cur.x]) {
          if (dist[nb.y][nb.x] > dcur + 1) {
            dist[nb.y][nb.x] = dcur + 1;
            queue.push(nb);
          }
        }
      }

      // AI：从候选里选一个距离玩家最远的格子
      let maxDist = -1;
      for (const c of candidates) {
        const d = dist[c.y][c.x];
        if (
          Number.isFinite(d) &&
          d > maxDist &&
          (c.x !== playerCell.x || c.y !== playerCell.y)
        ) {
          maxDist = d;
          aiCell = c;
        }
      }
    }

    playerSpawnPoint = cellToWorldCenter(playerCell.x, playerCell.y);
    aiSpawnPoint = cellToWorldCenter(aiCell.x, aiCell.y);

    // —— 把所有仍然存在的墙，转成矩形障碍（坦克/子弹碰撞使用） ——

    // 垂直墙
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols + 1; x++) {
        if (!verticalWalls[y][x]) continue;
        const wx = originX + x * cellSize - wallThickness / 2;
        const wy = originY + y * cellSize;
        obstacles.push({
          x: wx,
          y: wy,
          w: wallThickness,
          h: cellSize,
        });
      }
    }

    // 水平墙
    for (let y = 0; y < rows + 1; y++) {
      for (let x = 0; x < cols; x++) {
        if (!horizontalWalls[y][x]) continue;
        const wx = originX + x * cellSize;
        const wy = originY + y * cellSize - wallThickness / 2;
        obstacles.push({
          x: wx,
          y: wy,
          w: cellSize,
          h: wallThickness,
        });
      }
    }

    // 保存迷宫信息（后续想做调试/可视化可以用）
    maze = {
      cols,
      rows,
      cellSize,
      originX,
      originY,
      verticalWalls,
      horizontalWalls,
      neighbors,
      playerCell,
      aiCell,
    };
  }

  // 给旧代码留个壳：任何地方调用 generateObstacles()，现在都会生成迷宫而不是随机砖块。
  function generateObstacles() {
    generateMazeMap();
  }


  // 为了兼容原来的调用名字，这里保留 generateObstacles，但内部改用迷宫生成
  function generateObstacles() {
    generateMazeMap();
  }


  // ===== 坦克 & 子弹对象 =====
  function createPlayerTank() {
    return {
      type: "player",
      x: 0,
      y: 0,
      radius: CONFIG.tankRadius,
      color: "#4caf50",
      angle: -Math.PI / 2,
      vx: 0,
      vy: 0,
      shootCooldown: 0,
      isAlive: true,   // 是否存活，用于 3 秒判定 & 禁止幽灵移动/开火
    };
  }

  function createAiTank() {
    return {
      type: "ai",
      x: 0,
      y: 0,
      radius: CONFIG.tankRadius,
      color: "#ff5252",
      angle: Math.PI / 2,
      facingX: 0,
      facingY: 1,
      vx: 0,
      vy: 0,
      shootCooldown: 0,
      path: [],
      pathIndex: 0,
      repathCooldown: 0,
      moveJitterTimer: 0,
      jitterSide: 0,
      reactionTimer: 0,
      isAlive: true,   // 同样加上存活标记
    };
  }


    function isTankCollidingWithObstacles(tank) {
    for (const o of obstacles) {
      // ① 车体：用一个圆形碰撞（原逻辑）
      if (circleIntersectsRect(tank.x, tank.y, tank.radius, o)) {
        return true;
      }
      // ② 炮管：用一条线段近似整根炮管，如果插进墙体，也算碰撞
      if (tankGunIntersectsRect(tank, o)) {
        return true;
      }
    }
    return false;
  }
  function placeTankAtMazeSpawn(tank) {
    const spawn =
      tank.type === "player" ? playerSpawnPoint : aiSpawnPoint;

    if (!spawn) {
      // 极端兜底：如果迷宫还没生成好，就先放在屏幕中心
      tank.x = CONFIG.canvasWidth / 2;
      tank.y = CONFIG.canvasHeight / 2;
      return;
    }

    tank.x = spawn.x;
    tank.y = spawn.y;
  }
  function placeTankAtSpawn(tank, spawnRect, otherTank) {
    const r = tank.radius;
    const maxAttempts = 40;
    for (let i = 0; i < maxAttempts; i++) {
      const x = randomRange(spawnRect.x + r, spawnRect.x + spawnRect.w - r);
      const y = randomRange(spawnRect.y + r, spawnRect.y + spawnRect.h - r);
      tank.x = x;
      tank.y = y;
      if (isTankCollidingWithObstacles(tank)) continue;
      if (otherTank) {
        const dx = tank.x - otherTank.x;
        const dy = tank.y - otherTank.y;
        const minDist = tank.radius * 2 + 60;
        if (dx * dx + dy * dy < minDist * minDist) continue;
      }
      return;
    }
    tank.x = spawnRect.x + spawnRect.w / 2;
    tank.y = spawnRect.y + spawnRect.h / 2;
  }

   function respawnTank(tank) {
    // 小局内重生时，也使用当前迷宫的出生点逻辑
    placeTankAtMazeSpawn(tank);
  }


  function countBulletsForOwner(owner) {
    let count = 0;
    for (const b of bullets) {
      if (b.owner === owner) count++;
    }
    return count;
  }

  function spawnBulletFromTank(tank) {
    const forward = getTankForwardVector(tank);

  // 子弹出生点在坦克前方，确保不会卡在坦克内部
    const spawnOffset = tank.radius + CONFIG.bulletRadius + 4; // +4 再多留一点距离
    const x = tank.x + forward.x * spawnOffset;
    const y = tank.y + forward.y * spawnOffset;

    const bullet = {
    x,
    y,
    vx: forward.x * CONFIG.bulletSpeed,
    vy: forward.y * CONFIG.bulletSpeed,
    radius: CONFIG.bulletRadius,
    bouncesLeft: CONFIG.bulletMaxBounces,
    life: 0,
    owner: tank.type, // 记录是谁打的，计分用
  };

  bullets.push(bullet);
  SoundManager.shoot();
}
  function moveTankWithCollisions(tank, moveX, moveY) {
    const r = tank.radius;

    if (moveX !== 0) {
      const oldX = tank.x;
      let newX = tank.x + moveX;
      newX = clamp(newX, r, CONFIG.canvasWidth - r);
      tank.x = newX;
      if (isTankCollidingWithObstacles(tank)) {
        tank.x = oldX;
      }
    }

    if (moveY !== 0) {
      const oldY = tank.y;
      let newY = tank.y + moveY;
      newY = clamp(newY, r, CONFIG.canvasHeight - r);
      tank.y = newY;
      if (isTankCollidingWithObstacles(tank)) {
        tank.y = oldY;
      }
    }
  }

  // ===== 玩家更新 =====
  function updatePlayer(dt) {
    if (!playerTank || !playerTank.isAlive) return;

    // 1）按键转换为“前进/后退 + 旋转”指令
    let moveDir = 0; // +1 前进，-1 后退
    if (input.up) moveDir += 1;
    if (input.down) moveDir -= 1;

    let rotateDir = 0; // +1 顺时针（右转），-1 逆时针（左转）
    if (input.right) rotateDir += 1;
    if (input.left) rotateDir -= 1;

    // 2）更新坦克朝向角度（先记下旧角度，方便撤销）
    const oldAngle = playerTank.angle;

    // angle 定义：0 为水平向右，顺时针为正角度。
    playerTank.angle += rotateDir * TANK_ROTATE_SPEED * dt;

    // 把 angle 归一到 [-π, π] 范围，避免无限增大导致精度问题
    if (playerTank.angle > Math.PI) playerTank.angle -= Math.PI * 2;
    if (playerTank.angle < -Math.PI) playerTank.angle += Math.PI * 2;

    // ★ 旋转后的炮管如果戳进墙里，就撤回这次旋转，保持上一帧的角度
    if (isTankCollidingWithObstacles(playerTank)) {
      playerTank.angle = oldAngle;
    }

    // 3）根据当前朝向和“前进/后退指令”计算速度向量
    const forward = getTankForwardVector(playerTank);
    const moveSpeed = CONFIG.tankSpeedByDifficulty[currentDifficulty];
    const vx = forward.x * moveSpeed * moveDir;
    const vy = forward.y * moveSpeed * moveDir;

    playerTank.vx = vx;
    playerTank.vy = vy;

    // 平移时同样会走“车体 + 炮管”的碰撞
    moveTankWithCollisions(playerTank, vx * dt, vy * dt);

    // 4）射击冷却
    if (playerTank.shootCooldown > 0) {
      playerTank.shootCooldown -= dt;
    }

    // 5）按当前朝向，从炮口位置发射子弹
    if (input.fire && playerTank.shootCooldown <= 0) {
      if (countBulletsForOwner("player") < CONFIG.maxBulletsPerTank) {
        spawnBulletFromTank(playerTank);
        playerTank.shootCooldown = CONFIG.playerShootInterval;
      }
    }
  }


  // ===== AI 预判射击 =====
  function computeLeadDirection(relX, relY, targetVx, targetVy, bulletSpeed) {
    const rDotV = relX * targetVx + relY * targetVy;
    const v2 = targetVx * targetVx + targetVy * targetVy;
    const r2 = relX * relX + relY * relY;
    const s2 = bulletSpeed * bulletSpeed;
    const a = v2 - s2;
    const b = 2 * rDotV;
    const c = r2;
    let t;

    if (Math.abs(a) < 1e-6) {
      if (Math.abs(b) < 1e-6) {
        return null;
      }
      t = -c / b;
    } else {
      const disc = b * b - 4 * a * c;
      if (disc < 0) return null;
      const sqrt = Math.sqrt(disc);
      const t1 = (-b - sqrt) / (2 * a);
      const t2 = (-b + sqrt) / (2 * a);
      t = Infinity;
      if (t1 > 0 && t1 < t) t = t1;
      if (t2 > 0 && t2 < t) t = t2;
      if (!isFinite(t) || t <= 0) return null;
    }

    const aimX = relX + targetVx * t;
    const aimY = relY + targetVy * t;
    const len = Math.hypot(aimX, aimY);
    if (!len) return null;
    return { x: aimX / len, y: aimY / len };
  }

  function applyAimError(dirX, dirY, degrees) {
    const maxRad = (degrees * Math.PI) / 180;
    const offset = (Math.random() * 2 - 1) * maxRad;
    const cos = Math.cos(offset);
    const sin = Math.sin(offset);
    const rx = dirX * cos - dirY * sin;
    const ry = dirX * sin + dirY * cos;
    const len = Math.hypot(rx, ry) || 1;
    return { x: rx / len, y: ry / len };
  }

  function hasLineOfSight(x1, y1, x2, y2) {
    for (const o of obstacles) {
      if (segmentIntersectsRect(x1, y1, x2, y2, o)) {
        return false;
      }
    }
    return true;
  }

  function decideAIShoot(ai, player) {
    const dx = player.x - ai.x;
    const dy = player.y - ai.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 650) return false;
    if (!hasLineOfSight(ai.x, ai.y, player.x, player.y)) {
      // 偶尔赌一个反弹
      return Math.random() < 0.18;
    }
    return true;
  }

  function fireAIBullet(ai, player) {
  const params = DIFFICULTY_PARAMS[currentDifficulty];

  // 先算出“直接朝玩家”的方向
  const relX = player.x - ai.x;
  const relY = player.y - ai.y;
  const dist = Math.hypot(relX, relY) || 1;
  const directDir = { x: relX / dist, y: relY / dist };

  // 再做一个基于玩家速度的预判方向
  const leadDir = computeLeadDirection(
    relX,
    relY,
    player.vx,
    player.vy,
    CONFIG.bulletSpeed
  );

  let dirX = directDir.x;
  let dirY = directDir.y;

  if (leadDir) {
    const f = params.predictionFactor; // 不同难度预测程度不同
    dirX = directDir.x * (1 - f) + leadDir.x * f;
    dirY = directDir.y * (1 - f) + leadDir.y * f;
  }

  const len = Math.hypot(dirX, dirY) || 1;
  dirX /= len;
  dirY /= len;

  // 加一点误差，避免命中率过高
  const withError = applyAimError(dirX, dirY, params.aimErrorDeg);

  // —— 关键：把 AI 的炮口朝向（angle）对准这个射击方向 ——
  ai.angle = Math.atan2(withError.y, withError.x);

  // 使用统一的“从坦克炮口发射子弹”函数
  spawnBulletFromTank(ai);
}

  // ===== AI 更新（困难为默认） =====
  function updateAI(dt) {
    if (!aiTank || !aiTank.isAlive || !playerTank) return;
    const params = DIFFICULTY_PARAMS[currentDifficulty];
    const baseSpeed =
      CONFIG.tankSpeedByDifficulty[currentDifficulty] *
      CONFIG.aiSpeedFactor[currentDifficulty];

    // 路径重算：让 AI 绕障碍靠近你
    aiTank.repathCooldown -= dt;
    if (aiTank.repathCooldown <= 0) {
      // 把重算间隔稍微调小一点，这样被卡墙时能更快换路
      aiTank.repathCooldown = 0.5;
      const startCell = worldToCell(aiTank.x, aiTank.y);
      const goalCell = worldToCell(playerTank.x, playerTank.y);
      const path = findPath(startCell, goalCell);
      if (path.length > 0) {
        aiTank.path = path;
        aiTank.pathIndex = 0;
      } else {
        aiTank.path = [];
      }
    }

    // 先算“希望前进的方向” dirX / dirY
    let dirX = 0;
    let dirY = 0;

    if (aiTank.path && aiTank.path.length > 0) {
      let target = aiTank.path[aiTank.pathIndex];
      const dx = target.x - aiTank.x;
      const dy = target.y - aiTank.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 10 && aiTank.pathIndex < aiTank.path.length - 1) {
        aiTank.pathIndex++;
        target = aiTank.path[aiTank.pathIndex];
      }
      const dx2 = target.x - aiTank.x;
      const dy2 = target.y - aiTank.y;
      const dist2 = Math.hypot(dx2, dy2);
      if (dist2 > 2) {
        dirX = dx2 / dist2;
        dirY = dy2 / dist2;
      }
    } else {
      // 没有路径（比如你和它在同一个小房间），就直接朝你冲
      const dx = playerTank.x - aiTank.x;
      const dy = playerTank.y - aiTank.y;
      const d = Math.hypot(dx, dy) || 1;
      dirX = dx / d;
      dirY = dy / d;
    }

    // 少量随机抖动，让 AI 不那么机械
    aiTank.moveJitterTimer -= dt;
    if (aiTank.moveJitterTimer <= 0) {
      aiTank.moveJitterTimer = 0.7 + Math.random() * 0.8;
      const r = Math.random();
      if (r < 0.33) aiTank.jitterSide = -1;
      else if (r < 0.66) aiTank.jitterSide = 1;
      else aiTank.jitterSide = 0;
    }

    if (aiTank.jitterSide !== 0 && (dirX !== 0 || dirY !== 0)) {
      const sideX = -dirY * aiTank.jitterSide;
      const sideY = dirX * aiTank.jitterSide;
      dirX = dirX * 0.9 + sideX * 0.4;
      dirY = dirY * 0.9 + sideY * 0.4;
      const len = Math.hypot(dirX, dirY) || 1;
      dirX /= len;
      dirY /= len;
    }

    // —— 根据希望前进方向来“转向”，再沿当前 angle 前进 ——
      if (dirX !== 0 || dirY !== 0) {
    const targetAngle = Math.atan2(dirY, dirX);

    let diff = targetAngle - aiTank.angle;
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;

    const maxTurn = TANK_ROTATE_SPEED * 1.1 * dt;
    const turn = clamp(diff, -maxTurn, maxTurn);

    const oldAngle = aiTank.angle;
    aiTank.angle += turn;

    // AI 旋转后如果炮管穿墙，也把角度拉回去，避免原地疯狂扫墙
    if (isTankCollidingWithObstacles(aiTank)) {
      aiTank.angle = oldAngle;
    }
  }


    // 用当前 angle 作为真正的前进方向
    const forward = getTankForwardVector(aiTank);
    aiTank.vx = forward.x * baseSpeed;
    aiTank.vy = forward.y * baseSpeed;
    moveTankWithCollisions(aiTank, aiTank.vx * dt, aiTank.vy * dt);

    // 保持 facingX/facingY 与 angle 一致
    aiTank.facingX = forward.x;
    aiTank.facingY = forward.y;

    // 射击逻辑
    if (aiTank.shootCooldown > 0) {
      aiTank.shootCooldown -= dt;
    }
    aiTank.reactionTimer = Math.max(0, aiTank.reactionTimer - dt);

    if (aiTank.shootCooldown <= 0 && aiTank.reactionTimer <= 0) {
      if (countBulletsForOwner("ai") < CONFIG.maxBulletsPerTank) {
        if (decideAIShoot(aiTank, playerTank)) {
          fireAIBullet(aiTank, playerTank);
          const interval = randomRange(
            params.fireIntervalMin,
            params.fireIntervalMax
          );
          aiTank.shootCooldown = interval;
          aiTank.reactionTimer = params.reactionDelay;
        }
      }
    }
  }



  // ===== 击中判定 & 计分 =====
  // ===== 击中判定 & 小局结束入口 =====
  // 当前简化规则：
  //   - 谁打死对方，谁赢得本小局；
  //   - 任意一方死亡就立即结束本小局，不考虑“几乎同时死亡”的平局情况
  //     （后续会用 3 秒判定窗口来处理自杀、双杀和平局）。
  //
  // 这里不直接重置坦克，而是：
  //   1）根据击中信息算出本小局结果 result；
  //   2）把结果记到 pendingRoundResult，交给主循环在当帧末尾统一调用 endRound。
  // ===== 击中判定 & 3 秒判定窗口 =====
  // 规则：
  //   - 任意坦克被任意子弹击中立即判定为“死亡”，但不会立刻结束小局；
  //   - 第一次有人阵亡时，开启一个最多 3 秒的判定窗口（roundJudgeTimer）；
  //   - 如果在这 3 秒内对手也死亡 => 双杀，立即把 pendingRoundResult 设为 "draw"；
  //   - 如果 3 秒过去仍然只有一方死亡 => 存活的一方胜利，由 gameLoop 按存活方决定结果。
  function handleTankHit(victim) {
    if (!victim || !victim.isAlive) return;

    // 标记坦克死亡，并停止其移动/开火
    victim.isAlive = false;
    victim.vx = 0;
    victim.vy = 0;
    victim.shootCooldown = Infinity;

    SoundManager.hit();

    // 第一次有人阵亡：开启 3 秒判定窗口
    if (roundJudgeTimer <= 0) {
      // 这里不直接记录绝对时间戳，而是用一个 3 秒倒计时，
      // 在 gameLoop 中按 dt 递减，更适合游戏主循环。
      roundJudgeTimer = 3.0;
    }

    const playerDead = playerTank && !playerTank.isAlive;
    const aiDead = aiTank && !aiTank.isAlive;

    // 双杀（可能是自杀 + 反弹、或双方互相击杀）：直接判定平局，
    // 在 gameLoop 本帧末尾统一调用 endRound("draw")。
    if (playerDead && aiDead && !pendingRoundResult) {
      pendingRoundResult = "draw";
    }
  }



  // ===== 子弹更新 + 疯狂弹墙 =====
  function updateBullets(dt) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.life += dt;
      if (b.life > CONFIG.bulletLifeTime) {
        bullets.splice(i, 1);
        continue;
      }

      const moveX = b.vx * dt;
      const moveY = b.vy * dt;

      // X 轴
      if (moveX !== 0) {
        const prevX = b.x;
        b.x += moveX;

        if (b.x - b.radius < 0 || b.x + b.radius > CONFIG.canvasWidth) {
          if (b.bouncesLeft > 0) {
            b.x = clamp(b.x, b.radius, CONFIG.canvasWidth - b.radius);
            b.vx *= -1;
            b.bouncesLeft--;
            SoundManager.bounce();
          } else {
            bullets.splice(i, 1);
            continue;
          }
        }

        let collided = null;
        for (const o of obstacles) {
          if (circleIntersectsRect(b.x, b.y, b.radius, o)) {
            collided = o;
            break;
          }
        }
        if (collided) {
          if (b.bouncesLeft > 0) {
            if (prevX < collided.x && b.vx > 0) {
              b.x = collided.x - b.radius;
            } else if (prevX > collided.x + collided.w && b.vx < 0) {
              b.x = collided.x + collided.w + b.radius;
            }
            b.vx *= -1;
            b.bouncesLeft--;
            SoundManager.bounce();
          } else {
            bullets.splice(i, 1);
            continue;
          }
        }
      }

      // Y 轴
      if (moveY !== 0) {
        const prevY = b.y;
        b.y += moveY;

        if (b.y - b.radius < 0 || b.y + b.radius > CONFIG.canvasHeight) {
          if (b.bouncesLeft > 0) {
            b.y = clamp(b.y, b.radius, CONFIG.canvasHeight - b.radius);
            b.vy *= -1;
            b.bouncesLeft--;
            SoundManager.bounce();
          } else {
            bullets.splice(i, 1);
            continue;
          }
        }

        let collidedY = null;
        for (const o of obstacles) {
          if (circleIntersectsRect(b.x, b.y, b.radius, o)) {
            collidedY = o;
            break;
          }
        }
        if (collidedY) {
          if (b.bouncesLeft > 0) {
            if (prevY < collidedY.y && b.vy > 0) {
              b.y = collidedY.y - b.radius;
            } else if (prevY > collidedY.y + collidedY.h && b.vy < 0) {
              b.y = collidedY.y + collidedY.h + b.radius;
            }
            b.vy *= -1;
            b.bouncesLeft--;
            SoundManager.bounce();
          } else {
            bullets.splice(i, 1);
            continue;
          }
        }
      }

      // 击中坦克（子弹不分敌我：任何子弹打中任意坦克都算击杀，可以自杀 / 误杀队友）
      if (playerTank && playerTank.isAlive) {
        const dx = b.x - playerTank.x;
        const dy = b.y - playerTank.y;
        const rr = b.radius + playerTank.radius;
        if (dx * dx + dy * dy <= rr * rr) {
          bullets.splice(i, 1);
          handleTankHit(playerTank);
          continue;
        }
      }
      if (aiTank && aiTank.isAlive) {
        const dx = b.x - aiTank.x;
        const dy = b.y - aiTank.y;
        const rr = b.radius + aiTank.radius;
        if (dx * dx + dy * dy <= rr * rr) {
          bullets.splice(i, 1);
          handleTankHit(aiTank);
          continue;
        }
      }
    }
  }

  // ===== HUD & 结束 =====
  function updateHUD() {
    playerScoreEl.textContent = `${playerScore}`;
    aiScoreEl.textContent = `${aiScore}`;

    if (currentMode === GameMode.TIME) {
      timerEl.style.visibility = "visible";
      timerEl.textContent = formatTime(remainingTime);
    } else {
      timerEl.style.visibility = "hidden";
    }

    modeLabelEl.textContent =
      currentMode === GameMode.SCORE
        ? `模式：计分制（先到 ${CONFIG.scoreTarget} 分）`
        : "模式：计时制（5 分钟）";

    let diffStr = "困难";
    if (currentDifficulty === "easy") diffStr = "简单";
    else if (currentDifficulty === "normal") diffStr = "普通";
    difficultyLabelEl.textContent = `难度：${diffStr}`;
  }

  function endGame(message) {
    if (gameState === "gameOver") return;
    gameState = "gameOver";
    hudEl.classList.add("hidden");
    overlayEl.classList.remove("hidden");

    resultTextEl.textContent = message;
    finalScoreTextEl.textContent = `玩家 ${playerScore} : ${aiScore} 电脑`;

    if (currentMode === GameMode.TIME) {
      const used = CONFIG.timeLimit - remainingTime;
      timeInfoEl.textContent = `计时制 · 总时长 5 分钟 · 实际用时 ${formatTime(
        used
      )}`;
    } else {
      timeInfoEl.textContent = "";
    }

    if (playerScore > aiScore) {
      SoundManager.win();
    } else if (aiScore > playerScore) {
      SoundManager.lose();
    } else {
      SoundManager.play(400, 0.25, "triangle", 0.16);
    }
  }

  function triggerTimeModeEnd() {
    if (playerScore > aiScore) {
      endGame("时间到！你赢了");
    } else if (aiScore > playerScore) {
      endGame("时间到！电脑获胜");
    } else {
      endGame("时间到！平局");
    }
  }

  // ===== 小局（回合）控制 =====
  // 每一小局的生命周期：startNewRound -> （双方对战） -> 其中一方死亡 -> handleTankHit -> endRound。
  // 当前版本采用简化规则：
  //   - 任意一方死亡立即结束本小局；
  //   - 胜者 +1 分，平局不计分；
  //   - 随后立刻开始下一小局（迷宫暂时沿用同一张，不刷新）。
  // 后续会在 endRound 内扩展“3 秒判定 + 自杀/双杀规则 + 刷新迷宫”的完整逻辑。
  function startNewRound() {
    // 小局编号递增，方便以后做调试或在 UI 上显示“第 N 局”
    roundIndex++;
    isRoundActive = true;

    // 每一小局开始时重置 3 秒判定状态
    roundJudgeTimer = 0;
    pendingRoundResult = null;

    // 确保坦克对象已存在（首局由 resetMatch 创建，之后每局复用）
    if (!playerTank) {
      playerTank = createPlayerTank();
    }
    if (!aiTank) {
      aiTank = createAiTank();
    }

    // 重置玩家坦克基础状态
    playerTank.vx = 0;
    playerTank.vy = 0;
    playerTank.angle = -Math.PI / 2; // 默认朝上
    playerTank.shootCooldown = 0;
    playerTank.isAlive = true;

    // 重置 AI 坦克基础状态
    aiTank.vx = 0;
    aiTank.vy = 0;
    aiTank.angle = Math.PI / 2; // 默认朝下
    aiTank.shootCooldown = 0;
    aiTank.path = [];
    aiTank.pathIndex = 0;
    aiTank.repathCooldown = 0;
    aiTank.moveJitterTimer = 0;
    aiTank.jitterSide = 0;
    aiTank.reactionTimer = 0;
    aiTank.isAlive = true;

    // 使用当前迷宫的出生点放置坦克
    // （迷宫本身会在 resetMatch 或上一局 endRound 中被刷新）
    placeTankAtMazeSpawn(playerTank);
    placeTankAtMazeSpawn(aiTank);
  }


  // result: "playerWin" / "aiWin" / "draw"
  // 这个函数负责：
  //   - 根据小局结果更新比分；
  //   - 清空子弹；
  //   - 刷新迷宫 & 出生点；
  //   - 判断整场游戏是否结束（计分制）；
  //   - 如果整场未结束，则启动下一小局（保留总比分和剩余时间）。
  function endRound(result) {
    if (!isRoundActive) return; // 防止重复结束同一小局
    isRoundActive = false;

    // 一旦小局结果落定，立即清空场上所有子弹，
    // 防止残余子弹飞进下一局，或者影响 3 秒判定之后的新局。
    bullets = [];

    // 关闭 3 秒判定窗口
    roundJudgeTimer = 0;

    // 根据小局结果更新比分（胜者 +1 分，平局不加分）
    if (result === "playerWin") {
      playerScore++;
      SoundManager.hit();
    } else if (result === "aiWin") {
      aiScore++;
      SoundManager.hit();
    } else {
      // 平局：可以在这里增加特殊提示 / 音效
    }

    updateHUD();

    // 计分制：有人分数到达目标值则结束整场游戏
    if (currentMode === GameMode.SCORE) {
      if (playerScore >= CONFIG.scoreTarget) {
        endGame("你赢了！");
        return;
      }
      if (aiScore >= CONFIG.scoreTarget) {
        endGame("电脑获胜……");
        return;
      }
    }

    // 计时制：整场结束由计时器触发 triggerTimeModeEnd，
    // 这里只负责结束当前小局并在“整场仍在进行”时刷新迷宫并开下一局。
    if (gameState === "playing") {
      // ★ 关键：每次小局结束都刷新迷宫和导航网格，
      // 然后再用新的出生点开启下一局，比分和剩余时间全部保留。
      generateMazeMap();
      buildNavGrid();
      startNewRound();
    }
  }


  // ===== 整场对局重置（大模式重置） =====
  function resetMatch() {
    playerScore = 0;
    aiScore = 0;
    remainingTime = CONFIG.timeLimit;
    bullets = [];

    // 新的整场对战从第 0 局开始，随后 startNewRound 会递增到 1
    roundIndex = 0;
    isRoundActive = false;
    pendingRoundResult = null;
    roundJudgeTimer = 0;

    // 开局先生成一张迷宫；后续每次 endRound 也会重新生成新的迷宫。
    generateMazeMap();
    buildNavGrid();

    // 创建坦克对象（后续各小局复用）
    playerTank = createPlayerTank();
    aiTank = createAiTank();

    // 用 startNewRound 来开启第一小局
    startNewRound();

    updateHUD();
  }




  // ===== UI 按钮 =====
  function startGameFromMenu() {
    SoundManager.init();
    SoundManager.resume();
    currentDifficulty = difficultySelect.value;
    currentMode =
      modeSelect.value === "time" ? GameMode.TIME : GameMode.SCORE;

    menuEl.classList.add("hidden");
    overlayEl.classList.add("hidden");
    hudEl.classList.remove("hidden");

    resetMatch();
    gameState = "playing";
    pauseBtn.classList.remove("hidden");
    resumeBtn.classList.add("hidden");
  }

  startBtn.addEventListener("click", () => {
    startGameFromMenu();
  });

  pauseBtn.addEventListener("click", () => {
    pauseGame();
  });

  resumeBtn.addEventListener("click", () => {
    resumeGame();
  });

  restartBtn.addEventListener("click", () => {
    restartGame();
  });

  playAgainBtn.addEventListener("click", () => {
    restartGame();
  });

  backToMenuBtn.addEventListener("click", () => {
    backToMenu();
  });

  function pauseGame() {
    if (gameState !== "playing") return;
    gameState = "paused";
    pauseBtn.classList.add("hidden");
    resumeBtn.classList.remove("hidden");
  }

  function resumeGame() {
    if (gameState !== "paused") return;
    gameState = "playing";
    pauseBtn.classList.remove("hidden");
    resumeBtn.classList.add("hidden");
    lastTimestamp = performance.now();
  }

  function togglePause() {
    if (gameState === "playing") pauseGame();
    else if (gameState === "paused") resumeGame();
  }

  function restartGame() {
    overlayEl.classList.add("hidden");
    hudEl.classList.remove("hidden");
    resetMatch();
    gameState = "playing";
    pauseBtn.classList.remove("hidden");
    resumeBtn.classList.add("hidden");
  }

  function backToMenu() {
    gameState = "menu";
    overlayEl.classList.add("hidden");
    hudEl.classList.add("hidden");
    menuEl.classList.remove("hidden");
  }

  // ===== 渲染 =====
  function drawBackground() {
    ctx.fillStyle = "#102a43";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#243b53";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      CONFIG.mapPadding - 4,
      CONFIG.mapPadding - 4,
      canvas.width - CONFIG.mapPadding * 2 + 8,
      canvas.height - CONFIG.mapPadding * 2 + 8
    );
  }

  function drawObstacles() {
    for (const o of obstacles) {
      ctx.fillStyle = "#546e7a";
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = "#263238";
      ctx.lineWidth = 2;
      ctx.strokeRect(o.x, o.y, o.w, o.h);
    }
  }

  function drawTank(tank) {
    if (!tank) return;

    ctx.save();
    ctx.translate(tank.x, tank.y);
    ctx.rotate(tank.angle);

    const r = tank.radius;

    // 设计一个“长方形车体”的尺寸
    const bodyLength = r * 2.4;           // 车身前后长度
    const bodyWidth  = r * 1.3;           // 车身左右宽度
    const halfBodyL  = bodyLength / 2;
    const halfBodyW  = bodyWidth / 2;

    // 炮管长度与子弹出生距离一致，避免视觉错位
    const gunLength = r + CONFIG.bulletRadius + 4;
    const gunWidth  = 8;

    const treadWidth = 4;

    // 阴影：稍微比车体大一点
    ctx.fillStyle = "#00000033";
    ctx.fillRect(
      -halfBodyL - 3,
      -halfBodyW - treadWidth - 3,
      bodyLength + 6,
      bodyWidth + treadWidth * 2 + 6
    );

    // 车体（长方形）
    ctx.fillStyle = tank.color;
    ctx.fillRect(-halfBodyL, -halfBodyW, bodyLength, bodyWidth);

    // 车顶小舱
    ctx.fillStyle = "#e0f7fa";
    ctx.fillRect(-r * 0.4, -r * 0.4, r * 0.8, r * 0.8);

    // 炮管：默认沿 +X 方向，旋转后就是当前炮口方向
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, -gunWidth / 2, gunLength, gunWidth);

    // 两侧履带
    ctx.fillStyle = "#00000055";
    ctx.fillRect(-halfBodyL, -halfBodyW - treadWidth, bodyLength, treadWidth);
    ctx.fillRect(-halfBodyL, halfBodyW, bodyLength, treadWidth);

    ctx.restore();
  }


  function drawBullets() {
    for (const b of bullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = b.owner === "player" ? "#ffeb3b" : "#ff9800";
      ctx.fill();
    }
  }

  function drawHints() {
    if (gameState === "playing" || gameState === "paused") {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "16px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText("WASD 移动 · 空格 开火 · P 暂停", 16, canvas.height - 14);
    }

    if (gameState === "paused") {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.font = "32px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("已暂停", canvas.width / 2, canvas.height / 2);
    }
  }

  function render() {
    drawBackground();
    drawObstacles();
    drawBullets();
    drawTank(playerTank);
    drawTank(aiTank);
    drawHints();

    if (gameState === "gameOver") {
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  // ===== 主循环 =====
  let lastTimestamp = 0;

  function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const rawDt = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    const dt = Math.min(rawDt, 0.05); // 防止 tab 切回来时间步太大

        if (gameState === "playing") {
      // 计时制：这里负责扣整体时间 & 时间到触发整场结束
      if (currentMode === GameMode.TIME) {
        remainingTime -= dt;
        if (remainingTime <= 0) {
          remainingTime = 0;
          updateHUD();
          triggerTimeModeEnd();
        }
      }

      if (gameState === "playing") {
        // 小局进行中的正常更新：玩家、AI、子弹
        updatePlayer(dt);
        updateAI(dt);
        updateBullets(dt);

        // === 3 秒判定窗口处理 ===
        // 一旦有坦克在 handleTankHit 中死亡，就会把 roundJudgeTimer 设为 3。
        // 之后这 3 秒内仍然允许其它子弹继续飞行，看看会不会形成双杀：
        //   - 若在这段时间内另一方也死亡：handleTankHit 会立刻把 pendingRoundResult 设为 "draw"；
        //   - 若 3 秒倒计时结束时只有一方死亡：这里根据“谁还活着”来给出胜者。
        if (roundJudgeTimer > 0) {
          roundJudgeTimer -= dt;
          if (roundJudgeTimer <= 0 && !pendingRoundResult) {
            const playerAlive = playerTank && playerTank.isAlive;
            const aiAlive = aiTank && aiTank.isAlive;
            if (playerAlive && !aiAlive) {
              pendingRoundResult = "playerWin";
            } else if (!playerAlive && aiAlive) {
              pendingRoundResult = "aiWin";
            } else {
              // 理论上不会发生：要么双杀（已在 handleTankHit 判平局），要么一方存活。
              pendingRoundResult = "draw";
            }
          }
        }

        updateHUD();

        // 一旦本帧内已经得出小局结果（无论是双杀平局，还是 3 秒判定超时），
        // 都统一在这里调用 endRound 完成本小局收尾。
        if (pendingRoundResult) {
          const result = pendingRoundResult;
          pendingRoundResult = null;
          endRound(result);
        }
      }
    }


    // 一帧的渲染
    render();

    // 下一帧
    window.requestAnimationFrame(gameLoop);
  }
   window.requestAnimationFrame(gameLoop);
})();
