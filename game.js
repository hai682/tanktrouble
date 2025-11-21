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
      planInterval: 0.45,
      dodgeHorizon: 1.4,
      dodgeRadius: 44,
      aggression: 0.5,
      strafeIntervalMin: 1.0,
      strafeIntervalMax: 1.6,
    },
    normal: {
      fireIntervalMin: 0.9,
      fireIntervalMax: 1.4,
      predictionFactor: 0.8,
      aimErrorDeg: 15,
      reactionDelay: 0.25,
      planInterval: 0.32,
      dodgeHorizon: 1.5,
      dodgeRadius: 42,
      aggression: 0.65,
      strafeIntervalMin: 0.8,
      strafeIntervalMax: 1.3,
    },
    hard: {
      fireIntervalMin: 0.6,
      fireIntervalMax: 1.0,
      predictionFactor: 1.0,
      aimErrorDeg: 8,
      reactionDelay: 0.18,
      planInterval: 0.24,
      dodgeHorizon: 1.6,
      dodgeRadius: 40,
      aggression: 0.78,
      strafeIntervalMin: 0.6,
      strafeIntervalMax: 1.0,
    },
  };

  // ===== 统一配色（方便整体换肤） =====
  const COLORS = {
    background: "#020617", // 画布背景：更深的蓝灰，营造夜空感
    mazeWall: "#142040", // 迷宫墙体：比背景亮两档
    mazeOutline: "#273a5f", // 迷宫墙描边：再亮一点的蓝灰
    mazeFrame: "#304269", // 迷宫外围柔和描边（配合半透明减弱黑框感）
    tank1: "#4ade80", // 玩家1 坦克主体：亮绿色
    tank2: "#ff6b6b", // 玩家2 坦克主体：亮红色
    tankBarrel: "#f8fafc", // 炮管使用的浅色
    tankTread: "#00000066", // 履带阴影
    bullet: "#020202", // 子弹主体：纯黑
    bulletOutline: "#94a3b8", // 子弹细描边，防止在深色背景里丢失
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
  const battleModeSelect = document.getElementById("battleModeSelect");
  const startBtn = document.getElementById("startBtn");
  const muteBtn = document.getElementById("muteBtn");

  const controlHintBar = document.getElementById("controlHintBar");

  const player1LabelEl = document.getElementById("player1Label");
  const player2LabelEl = document.getElementById("player2Label");
  const playerScoreEl = document.getElementById("playerScore");
  const aiScoreEl = document.getElementById("aiScore");
  const timerEl = document.getElementById("timer");
  const modeLabelEl = document.getElementById("modeLabel");
  const difficultyLabelEl = document.getElementById("difficultyLabel");

  const pauseBtn = document.getElementById("pauseBtn");
  const resumeBtn = document.getElementById("resumeBtn");
  const restartBtn = document.getElementById("restartBtn");
  const pauseOverlay = document.getElementById("pauseOverlay");
  const pauseResumeBtn = document.getElementById("pauseResumeBtn");
  const pauseMenuBtn = document.getElementById("pauseMenuBtn");

  const resultTextEl = document.getElementById("resultText");
  const finalScoreTextEl = document.getElementById("finalScoreText");
  const timeInfoEl = document.getElementById("timeInfo");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const backToMenuBtn = document.getElementById("backToMenuBtn");

  canvas.width = CONFIG.canvasWidth;
  canvas.height = CONFIG.canvasHeight;

  // ===== 输入状态 =====
  const input = {
    // 双人按键状态拆成两个对象，避免互相覆盖
    player1: { up: false, down: false, left: false, right: false, fire: false },
    player2: { up: false, down: false, left: false, right: false, fire: false },
  };
  const activeKeys = new Set();
  const suppressedKeys = new Set();

  function clearAllInputStates() {
    // 统一清除本地缓存的按键状态，并把“仍然按住”的按键编号放进 suppressedKeys，
    // 这样即便玩家一直长按，也必须先抬起再按一次，才会重新被识别（避免上一局长按影响下一局）。
    for (const key of Object.keys(input.player1)) {
      input.player1[key] = false;
    }
    for (const key of Object.keys(input.player2)) {
      input.player2[key] = false;
    }
    for (const code of activeKeys) {
      suppressedKeys.add(code);
    }
    activeKeys.clear();
  }

  function handleKeyChange(e, isDown) {
    if (isDown) {
      activeKeys.add(e.code);
      if (suppressedKeys.has(e.code)) {
        // 当前按键因为刚切换小局而被“压住”，等待玩家抬起后再生效
        e.preventDefault();
        return;
      }
    } else {
      activeKeys.delete(e.code);
      suppressedKeys.delete(e.code);
    }
    switch (e.code) {
      // 玩家1：WASD + 空格
      case "KeyW":
        input.player1.up = isDown;
        e.preventDefault();
        break;
      case "KeyS":
        input.player1.down = isDown;
        e.preventDefault();
        break;
      case "KeyA":
        input.player1.left = isDown;
        e.preventDefault();
        break;
      case "KeyD":
        input.player1.right = isDown;
        e.preventDefault();
        break;
      case "Space":
        input.player1.fire = isDown;
        e.preventDefault();
        break;

      // 玩家2：方向键 + M
      case "ArrowUp":
        input.player2.up = isDown;
        e.preventDefault();
        break;
      case "ArrowDown":
        input.player2.down = isDown;
        e.preventDefault();
        break;
      case "ArrowLeft":
        input.player2.left = isDown;
        e.preventDefault();
        break;
      case "ArrowRight":
        input.player2.right = isDown;
        e.preventDefault();
        break;
      case "KeyM":
        input.player2.fire = isDown;
        e.preventDefault();
        break;

      case "KeyP":
        if (isDown && gameState === "playing") {
          togglePause();
          e.preventDefault();
        }
        break;
      case "Escape":
        if (isDown && gameState === "playing") {
          // Esc 作为暂停/继续开关
          togglePause();
          e.preventDefault();
        }
        break;
    }
  }

  window.addEventListener("keydown", (e) => handleKeyChange(e, true));
  window.addEventListener("keyup", (e) => handleKeyChange(e, false));

  // ===== 画布响应式缩放 =====
  function updateCanvasScale() {
    // 预留 32px 的窗口边距 + HUD 高度，确保画布不被遮挡
    const margin = 32;
    const hudHeight =
      hudEl.classList.contains("hidden") || !hudEl.offsetHeight
        ? 0
        : hudEl.offsetHeight + 16;
    const availableWidth = Math.max(320, window.innerWidth - margin);
    const availableHeight = Math.max(
      240,
      window.innerHeight - margin - hudHeight
    );
    const scaleX = availableWidth / CONFIG.canvasWidth;
    const scaleY = availableHeight / CONFIG.canvasHeight;
    const target = clamp(Math.min(scaleX, scaleY), 0.5, 1.5);
    const scaledWidth = CONFIG.canvasWidth * target;
    const scaledHeight = CONFIG.canvasHeight * target;
    canvas.style.width = `${scaledWidth}px`;
    canvas.style.height = `${scaledHeight}px`;
  }

  window.addEventListener("resize", updateCanvasScale);
  updateCanvasScale();

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

  // ===== 声音管理（集中控制关键反馈音效，屏蔽反弹/新局提示等噪音） =====
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
    explosion() {
      // 坦克死亡爆炸：使用噪声缓冲实现短促的爆炸声
      if (!this.enabled || !this.ctx) return;
      try {
        const ctx = this.ctx;
        const duration = 0.45;
        const buffer = ctx.createBuffer(1, duration * ctx.sampleRate, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const decay = 1 - i / data.length;
          data[i] = (Math.random() * 2 - 1) * decay;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 520;
        const gain = ctx.createGain();
        gain.gain.value = 0.26;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
      } catch {
        // 忽略音频异常
      }
    },
    win() {
      this.play(880, 0.25, "triangle", 0.18);
    },
    lose() {
      this.play(160, 0.3, "sine", 0.2);
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
  let gameState = "menu"; // menu / playing / gameOver
  let isPaused = false; // 是否处于暂停界面
  let currentMode = GameMode.SCORE;
  let currentDifficulty = "hard";
  let gameMode = battleModeSelect ? battleModeSelect.value : "pvp"; // "pvp" 玩家对战 / "pve" 玩家 vs AI

  let obstacles = [];
  let bullets = [];
  let explosions = []; // 爆炸/碎片效果集合
  let playerTank = null;
  let aiTank = null; // 在 PVP 模式下也沿用 aiTank 变量承载玩家2
  const aiBrain = {
    goal: null,
    goalTimer: 0,
    planCooldown: 0,
    strafeDir: 1,
    strafeTimer: 0,
    lastKnownPlayer: { x: 0, y: 0 },
  };
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
  let roundJudgeTimer = 0; // >0 表示正在等待 3 秒死亡判定窗口
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

    // —— 出生点：在所有“至少有一条出口的通行格子”中随机挑选 ——
    const candidates = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (neighbors[y][x].length >= 1) {
          candidates.push({ x, y });
        }
      }
    }

    let playerCell = { x: 0, y: 0 };
    let aiCell = { x: cols - 1, y: rows - 1 };

    if (candidates.length >= 2) {
      // 在候选列表里随机打乱一次，再取前两个不同的格子。
      const shuffled = [...candidates];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      playerCell = shuffled[0];
      aiCell = shuffled[1];
    } else if (candidates.length === 1) {
      // 极端兜底：只有一个合法格子时，把另一辆坦克放在对角附近。
      playerCell = candidates[0];
      aiCell = { x: clampInt(playerCell.x + 1, 0, cols - 1), y: clampInt(playerCell.y + 1, 0, rows - 1) };
    }

    // 把格子坐标转换成世界坐标，得到真正的出生点。
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
      color: COLORS.tank1,
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
      color: COLORS.tank2,
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

  // ===== 人类玩家（含玩家2）更新 =====
  function updateHumanTank(tank, controlState, ownerKey, dt) {
    if (!tank || !tank.isAlive) return;

    // 1）把键位状态翻译成“前进/后退 + 左右转”命令
    let moveDir = 0; // +1 前进，-1 后退
    if (controlState.up) moveDir += 1;
    if (controlState.down) moveDir -= 1;

    let rotateDir = 0; // +1 顺时针（右转），-1 逆时针（左转）
    if (controlState.right) rotateDir += 1;
    if (controlState.left) rotateDir -= 1;

    // 2）更新坦克朝向，依旧检查“炮管顶墙”后撤回
    const oldAngle = tank.angle;
    tank.angle += rotateDir * TANK_ROTATE_SPEED * dt;
    if (tank.angle > Math.PI) tank.angle -= Math.PI * 2;
    if (tank.angle < -Math.PI) tank.angle += Math.PI * 2;
    if (isTankCollidingWithObstacles(tank)) {
      tank.angle = oldAngle;
    }

    // 3）按当前朝向和 moveDir 计算速度
    const forward = getTankForwardVector(tank);
    const moveSpeed = CONFIG.tankSpeedByDifficulty[currentDifficulty];
    const vx = forward.x * moveSpeed * moveDir;
    const vy = forward.y * moveSpeed * moveDir;
    tank.vx = vx;
    tank.vy = vy;
    moveTankWithCollisions(tank, vx * dt, vy * dt);

    // 4）射击：各玩家共用冷却和上限
    if (tank.shootCooldown > 0) {
      tank.shootCooldown -= dt;
    }
    if (controlState.fire && tank.shootCooldown <= 0) {
      if (countBulletsForOwner(ownerKey) < CONFIG.maxBulletsPerTank) {
        spawnBulletFromTank(tank);
        tank.shootCooldown = CONFIG.playerShootInterval;
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

  function initAIBrain() {
    aiBrain.currentGoal = { type: "idle", priority: 0, ttl: 0, id: 0, continuous: true };
    aiBrain.actions = [];
    aiBrain.goalId = 1;
    aiBrain.planCooldown = 0;
    aiBrain.stuckTimer = 0;
    aiBrain.memory.lastKnownPlayer = playerTank
      ? { x: playerTank.x, y: playerTank.y }
      : { x: 0, y: 0 };
    aiBrain.memory.lastPos = aiTank
      ? { x: aiTank.x, y: aiTank.y }
      : { x: 0, y: 0 };
  }

  function normalizeAngle(angle) {
    let a = angle;
    if (a > Math.PI) a -= Math.PI * 2;
    if (a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  function steerTankTowards(tank, dirX, dirY, dt, turnScale = 1) {
    if (!dirX && !dirY) return;
    const targetAngle = Math.atan2(dirY, dirX);
    let diff = normalizeAngle(targetAngle - tank.angle);
    const maxTurn = TANK_ROTATE_SPEED * turnScale * dt;
    const turn = clamp(diff, -maxTurn, maxTurn);
    const oldAngle = tank.angle;
    tank.angle += turn;
    if (isTankCollidingWithObstacles(tank)) {
      tank.angle = oldAngle;
    }
  }

  // JS 移植版：原 AS 中 checkPathForCollision + checkBulletPath 的抽象版
  function simulateBulletPath(originX, originY, dirX, dirY, maxTime = CONFIG.bulletLifeTime) {
    let x = originX;
    let y = originY;
    let vx = dirX * CONFIG.bulletSpeed;
    let vy = dirY * CONFIG.bulletSpeed;
    let bouncesLeft = CONFIG.bulletMaxBounces;
    const radius = CONFIG.bulletRadius;
    const step = 0.05;
    let time = 0;
    let closestPlayer = Infinity;

    while (time < maxTime) {
      const dt = Math.min(step, maxTime - time);

      if (vx !== 0) {
        const prevX = x;
        x += vx * dt;
        if (x - radius < 0 || x + radius > CONFIG.canvasWidth) {
          if (bouncesLeft > 0) {
            x = clamp(x, radius, CONFIG.canvasWidth - radius);
            vx *= -1;
            bouncesLeft--;
          } else {
            return { result: "wall", time: time + dt, closest: closestPlayer };
          }
        }
        for (const o of obstacles) {
          if (circleIntersectsRect(x, y, radius, o)) {
            if (bouncesLeft > 0) {
              if (prevX < o.x && vx > 0) x = o.x - radius;
              else if (prevX > o.x + o.w && vx < 0) x = o.x + o.w + radius;
              vx *= -1;
              bouncesLeft--;
            } else {
              return { result: "wall", time: time + dt, closest: closestPlayer };
            }
          }
        }
      }

      if (vy !== 0) {
        const prevY = y;
        y += vy * dt;
        if (y - radius < 0 || y + radius > CONFIG.canvasHeight) {
          if (bouncesLeft > 0) {
            y = clamp(y, radius, CONFIG.canvasHeight - radius);
            vy *= -1;
            bouncesLeft--;
          } else {
            return { result: "wall", time: time + dt, closest: closestPlayer };
          }
        }
        for (const o of obstacles) {
          if (circleIntersectsRect(x, y, radius, o)) {
            if (bouncesLeft > 0) {
              if (prevY < o.y && vy > 0) y = o.y - radius;
              else if (prevY > o.y + o.h && vy < 0) y = o.y + o.h + radius;
              vy *= -1;
              bouncesLeft--;
            } else {
              return { result: "wall", time: time + dt, closest: closestPlayer };
            }
          }
        }
      }

      const distToPlayer = Math.hypot(playerTank.x - x, playerTank.y - y);
      closestPlayer = Math.min(closestPlayer, distToPlayer);

      const aiDist = Math.hypot(aiTank.x - x, aiTank.y - y);
      if (aiDist <= aiTank.radius + radius) {
        return { result: "self", time, closest: closestPlayer };
      }

      if (distToPlayer <= playerTank.radius + radius) {
        return { result: "player", time, closest: closestPlayer };
      }

      time += dt;
    }

    return { result: "nothing", time: maxTime, closest: closestPlayer };
  }

  // JS 移植版：原 AS 中 dodgeTrajectories 的核心思路
  function findBulletDodgeGoal(params) {
    const horizon = params.dodgeHorizon;
    const dangerRadius = params.dodgeRadius + aiTank.radius + CONFIG.bulletRadius;
    let best = null;

    for (const b of bullets) {
      if (b.owner === "ai") continue;
      const vx = b.vx;
      const vy = b.vy;
      const speed2 = vx * vx + vy * vy;
      if (speed2 < 1e-5) continue;
      const toTankX = aiTank.x - b.x;
      const toTankY = aiTank.y - b.y;
      const t = -((toTankX * vx + toTankY * vy) / speed2);
      if (t < 0 || t > horizon) continue;
      const closestX = b.x + vx * t;
      const closestY = b.y + vy * t;
      const dist = Math.hypot(aiTank.x - closestX, aiTank.y - closestY);
      if (dist > dangerRadius) continue;

      if (!hasLineOfSight(b.x, b.y, aiTank.x, aiTank.y)) continue;

      let dirX = aiTank.x - closestX;
      let dirY = aiTank.y - closestY;
      const len = Math.hypot(dirX, dirY) || 1;
      dirX /= len;
      dirY /= len;

      const score = (dangerRadius - dist) / dangerRadius + (horizon - t) / horizon;
      if (!best || score > best.score) {
        best = {
          type: "dodge",
          priority: 5 + score,
          ttl: Math.max(0.2, horizon - t),
          dir: { x: dirX, y: dirY },
          id: aiBrain.goalId++,
          continuous: false,
        };
      }
    }

    return best;
  }

  function buildBackAwayGoal() {
    if (aiBrain.stuckTimer < 0.8) return null;
    const forward = getTankForwardVector(aiTank);
    return {
      type: "backAway",
      priority: 2,
      ttl: 1,
      dir: { x: -forward.x, y: -forward.y },
      id: aiBrain.goalId++,
      continuous: false,
    };
  }

  // JS 移植版：原 AS 中 checkBulletPath 的射击评估
  function findDirectAttackGoal(params) {
    if (!aiTank || !playerTank) return null;
    const dx = playerTank.x - aiTank.x;
    const dy = playerTank.y - aiTank.y;
    const dist = Math.hypot(dx, dy) || 1;
    const lead = computeLeadDirection(
      dx,
      dy,
      playerTank.vx,
      playerTank.vy,
      CONFIG.bulletSpeed
    );

    const aimDir = lead
      ? {
          x: dx / dist * (1 - params.predictionFactor) + lead.x * params.predictionFactor,
          y: dy / dist * (1 - params.predictionFactor) + lead.y * params.predictionFactor,
        }
      : { x: dx / dist, y: dy / dist };
    const len = Math.hypot(aimDir.x, aimDir.y) || 1;
    aimDir.x /= len;
    aimDir.y /= len;

    const muzzleX = aiTank.x + aimDir.x * (aiTank.radius + CONFIG.bulletRadius + 2);
    const muzzleY = aiTank.y + aimDir.y * (aiTank.radius + CONFIG.bulletRadius + 2);
    const sim = simulateBulletPath(muzzleX, muzzleY, aimDir.x, aimDir.y);

    if (sim.result === "self") return null;

    if (sim.result === "player") {
      return {
        type: "attack",
        priority: 3 + params.aggression,
        ttl: params.planInterval * 2,
        aimDir,
        angle: Math.atan2(aimDir.y, aimDir.x),
        id: aiBrain.goalId++,
        continuous: false,
      };
    }

    if (sim.closest < 120) {
      return {
        type: "attack",
        priority: 1.5,
        ttl: params.planInterval,
        aimDir,
        angle: Math.atan2(aimDir.y, aimDir.x),
        id: aiBrain.goalId++,
        continuous: false,
      };
    }

    return null;
  }

  function buildChaseGoal(params) {
    const start = worldToCell(aiTank.x, aiTank.y);
    const target = worldToCell(playerTank.x, playerTank.y);
    const path = findPath(start, target);
    if (!path || path.length === 0) return null;

    const dist = Math.hypot(aiTank.x - playerTank.x, aiTank.y - playerTank.y);
    const priority = 1 + params.aggression + Math.max(0, 400 - dist) / 400;
    return {
      type: "chase",
      priority,
      ttl: params.planInterval * 2,
      path,
      id: aiBrain.goalId++,
      continuous: false,
    };
  }

  function buildWanderGoal() {
    const randomCell = {
      x: Math.floor(Math.random() * navGrid.cols),
      y: Math.floor(Math.random() * navGrid.rows),
    };
    const cs = navGrid.cellSize;
    const world = {
      x: randomCell.x * cs + cs / 2,
      y: randomCell.y * cs + cs / 2,
    };
    return {
      type: "wander",
      priority: 0.2,
      ttl: 1.5,
      target: { x: world.x, y: world.y },
      id: aiBrain.goalId++,
      continuous: false,
    };
  }

  function aiConsiderGoal(goal) {
    if (!goal) return;
    if (
      !aiBrain.currentGoal ||
      goal.priority > aiBrain.currentGoal.priority ||
      (goal.priority === aiBrain.currentGoal.priority && goal.id > aiBrain.currentGoal.id)
    ) {
      aiBrain.currentGoal = goal;
    }
  }

  // JS 移植版：原 AS 中 decideActionsToAchieveGoal
  function planActionsForGoal(goal, params) {
    aiBrain.actions = [];
    if (!goal) return;

    switch (goal.type) {
      case "dodge":
      case "backAway":
        aiBrain.actions.push({ type: "strafe", dir: goal.dir, duration: goal.ttl });
        break;
      case "attack":
        aiBrain.actions.push({ type: "fire", angle: goal.angle, delay: params.reactionDelay });
        aiBrain.actions.push({ type: "turnTo", angle: goal.angle });
        break;
      case "chase":
        for (let i = goal.path.length - 1; i >= 0; i--) {
          const wp = goal.path[i];
          aiBrain.actions.push({ type: "driveTo", x: wp.x, y: wp.y });
        }
        break;
      case "wander":
        aiBrain.actions.push({ type: "driveTo", x: goal.target.x, y: goal.target.y });
        break;
      default:
        break;
    }
  }

  // JS 移植版：原 AS 中 setInputToDoActions 的执行
  function executeAIActions(dt, params) {
    if (aiBrain.actions.length === 0) {
      return { moveDir: { x: 0, y: 0 }, fire: false, face: null };
    }

    const action = aiBrain.actions[aiBrain.actions.length - 1];
    let moveDir = { x: 0, y: 0 };
    let fire = false;
    let faceAngle = null;

    switch (action.type) {
      case "driveTo": {
        const dx = action.x - aiTank.x;
        const dy = action.y - aiTank.y;
        const dist = Math.hypot(dx, dy);
        if (dist < aiTank.radius * 0.8) {
          aiBrain.actions.pop();
          return executeAIActions(dt, params);
        }
        moveDir = { x: dx / (dist || 1), y: dy / (dist || 1) };
        faceAngle = Math.atan2(moveDir.y, moveDir.x);
        break;
      }
      case "turnTo": {
        faceAngle = action.angle;
        const diff = Math.abs(normalizeAngle(aiTank.angle - action.angle));
        if (diff < 0.05) {
          aiBrain.actions.pop();
          return executeAIActions(dt, params);
        }
        break;
      }
      case "strafe": {
        moveDir = action.dir;
        action.duration -= dt;
        if (action.duration <= 0) {
          aiBrain.actions.pop();
        }
        break;
      }
      case "fire": {
        faceAngle = action.angle;
        action.delay -= dt;
        const diff = Math.abs(normalizeAngle(aiTank.angle - action.angle));
        if (action.delay <= 0 && diff < 0.25) {
          fire = true;
          aiBrain.actions.pop();
        }
        break;
      }
      default:
        aiBrain.actions.pop();
        break;
    }

    return { moveDir, fire, face: faceAngle };
  }

  // JS 移植版：原 AS 中 makeDecisionsAndUpdateGoal 的核心逻辑
  function updateAIGoal(dt, params) {
    if (aiBrain.currentGoal && !aiBrain.currentGoal.continuous) {
      aiBrain.currentGoal.ttl -= dt;
      if (aiBrain.currentGoal.ttl <= 0) {
        aiBrain.currentGoal = { type: "idle", priority: 0, ttl: 0, id: 0, continuous: true };
      }
    }

    if (aiBrain.currentGoal) {
      aiBrain.currentGoal.priority *= 0.92;
    }

    const dodgeGoal = findBulletDodgeGoal(params);
    const backAway = buildBackAwayGoal();
    const attackGoal = findDirectAttackGoal(params);
    const chaseGoal = buildChaseGoal(params);
    const wanderGoal = buildWanderGoal();

    aiConsiderGoal(dodgeGoal);
    aiConsiderGoal(backAway);
    aiConsiderGoal(attackGoal);
    aiConsiderGoal(chaseGoal);
    aiConsiderGoal(wanderGoal);

    planActionsForGoal(aiBrain.currentGoal, params);
  }

  // JS 移植版：原 AS 中 setInputToDoActions 之后的控制
  function updateAI(dt) {
    if (!aiTank || !aiTank.isAlive || !playerTank) return;
    const params = DIFFICULTY_PARAMS[currentDifficulty];
    const baseSpeed =
      CONFIG.tankSpeedByDifficulty[currentDifficulty] *
      CONFIG.aiSpeedFactor[currentDifficulty];

    aiTank.reactionTimer = Math.max(0, aiTank.reactionTimer - dt);
    aiBrain.planCooldown = Math.max(0, aiBrain.planCooldown - dt);

    aiBrain.memory.lastKnownPlayer = { x: playerTank.x, y: playerTank.y };

    const moved = Math.hypot(
      aiTank.x - aiBrain.memory.lastPos.x,
      aiTank.y - aiBrain.memory.lastPos.y
    );
    if (moved < baseSpeed * dt * 0.25) {
      aiBrain.stuckTimer = Math.min(aiBrain.stuckTimer + dt, 2);
    } else {
      aiBrain.stuckTimer = Math.max(0, aiBrain.stuckTimer - dt * 0.5);
    }
    aiBrain.memory.lastPos = { x: aiTank.x, y: aiTank.y };

    if (aiBrain.planCooldown <= 0 || aiBrain.actions.length === 0) {
      aiBrain.planCooldown = params.planInterval;
      updateAIGoal(dt, params);
    }

    const intent = executeAIActions(dt, params);
    const dir = intent.moveDir;

    if (intent.face !== null) {
      steerTankTowards(aiTank, Math.cos(intent.face), Math.sin(intent.face), dt, 1);
    } else {
      steerTankTowards(aiTank, dir.x, dir.y, dt, 1);
    }

    const forward = getTankForwardVector(aiTank);
    const speed = dir.x === 0 && dir.y === 0 ? 0 : baseSpeed;
    aiTank.vx = forward.x * speed;
    aiTank.vy = forward.y * speed;
    moveTankWithCollisions(aiTank, aiTank.vx * dt, aiTank.vy * dt);

    aiTank.facingX = forward.x;
    aiTank.facingY = forward.y;

    if (aiTank.shootCooldown > 0) {
      aiTank.shootCooldown -= dt;
    }

    if (
      intent.fire &&
      aiTank.shootCooldown <= 0 &&
      aiTank.reactionTimer <= 0 &&
      countBulletsForOwner("ai") < CONFIG.maxBulletsPerTank
    ) {
      const aimDir = applyAimError(Math.cos(aiTank.angle), Math.sin(aiTank.angle), params.aimErrorDeg);
      aiTank.angle = Math.atan2(aimDir.y, aimDir.x);
      spawnBulletFromTank(aiTank);
      aiTank.shootCooldown = randomRange(params.fireIntervalMin, params.fireIntervalMax);
      aiTank.reactionTimer = params.reactionDelay;
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
  // 时间轴：
  //   1）第一辆坦克被击毁时，标记死亡并启动 3 秒倒计时（roundJudgeTimer = 3）。
  //   2）倒计时期间，无论对手是否立刻死亡，都保持当前局面并让玩家有 3 秒缓冲。
  //   3）倒计时归零后，才根据“存活情况”一次性判定胜负/平局，再交给 endRound。
  function handleTankHit(victim) {
    if (!victim || !victim.isAlive) return;

    // 标记坦克死亡，并停止其移动/开火
    victim.isAlive = false;
    victim.vx = 0;
    victim.vy = 0;
    victim.shootCooldown = Infinity;
    spawnExplosion(victim); // 触发爆炸效果与音效

    // 第一次有人阵亡：开启 3 秒判定窗口
    if (roundJudgeTimer <= 0) {
      // 这里不直接记录绝对时间戳，而是用一个 3 秒倒计时，
      // 在 gameLoop 中按 dt 递减，更适合游戏主循环。
      roundJudgeTimer = 3.0;
    }

    // 双杀/单杀的最终胜负在 gameLoop 中 roundJudgeTimer 归零时统一判断，
    // 这里不再立即给出结果，保证“无论如何都等待满 3 秒”这一体验。
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

    const playerName = gameMode === "pvp" ? "玩家1" : "玩家";
    const opponentName = gameMode === "pvp" ? "玩家2" : "电脑";
    player1LabelEl.textContent = playerName;
    player2LabelEl.textContent = opponentName;

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

    if (controlHintBar) {
      controlHintBar.textContent =
        gameMode === "pvp"
          ? "玩家1：WASD + 空格 ｜ 玩家2：方向键 + M ｜ Esc 暂停"
          : "玩家：WASD + 空格 ｜ 电脑：自动行动 ｜ Esc 暂停";
    }
  }

  function endGame(message) {
    if (gameState === "gameOver") return;
    gameState = "gameOver";
    isPaused = false;
    pauseOverlay.classList.add("hidden");
    pauseBtn.classList.add("hidden");
    resumeBtn.classList.add("hidden");
    hudEl.classList.add("hidden");
    overlayEl.classList.remove("hidden");

    resultTextEl.textContent = message;
    const playerName = gameMode === "pvp" ? "玩家1" : "玩家";
    const opponentName = gameMode === "pvp" ? "玩家2" : "电脑";
    finalScoreTextEl.textContent = `${playerName} ${playerScore} : ${aiScore} ${opponentName}`;

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
      endGame(gameMode === "pvp" ? "时间到！玩家1 获胜" : "时间到！你赢了");
    } else if (aiScore > playerScore) {
      endGame(gameMode === "pvp" ? "时间到！玩家2 获胜" : "时间到！电脑获胜");
    } else {
      endGame("时间到！平局");
    }
  }

  // ===== 爆炸与碎片动画 =====
  function spawnExplosion(tank) {
    if (!tank) return;
    const fragmentCount = 10 + Math.floor(Math.random() * 6);
    const fragments = [];
    for (let i = 0; i < fragmentCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomRange(80, 220);
      fragments.push({
        x: tank.x,
        y: tank.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: randomRange(4, 7),
        life: 0,
        lifeTime: randomRange(0.4, 0.6),
        color: tank.color,
      });
    }
    explosions.push({ fragments });
    SoundManager.explosion();
  }

  function updateExplosions(dt) {
    for (let i = explosions.length - 1; i >= 0; i--) {
      const explosion = explosions[i];
      let living = 0;
      for (const frag of explosion.fragments) {
        if (frag.life >= frag.lifeTime) continue;
        frag.life += dt;
        frag.x += frag.vx * dt;
        frag.y += frag.vy * dt;
        frag.vx *= 0.9;
        frag.vy *= 0.9;
        frag.size *= 0.985;
        if (frag.life < frag.lifeTime) {
          living++;
        }
      }
      if (living === 0) {
        explosions.splice(i, 1);
      }
    }
  }

  function drawExplosions() {
    for (const explosion of explosions) {
      for (const frag of explosion.fragments) {
        if (frag.life >= frag.lifeTime) continue;
        const progress = frag.life / frag.lifeTime;
        const alpha = 1 - progress;
        const size = Math.max(1, frag.size * (1 - progress * 0.6));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = frag.color;
        ctx.fillRect(frag.x - size / 2, frag.y - size / 2, size, size);
        ctx.restore();
      }
    }
  }

  // ===== 爆炸与碎片动画 =====
  function spawnExplosion(tank) {
    if (!tank) return;
    const fragmentCount = 10 + Math.floor(Math.random() * 6);
    const fragments = [];
    for (let i = 0; i < fragmentCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomRange(80, 220);
      fragments.push({
        x: tank.x,
        y: tank.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: randomRange(4, 7),
        life: 0,
        lifeTime: randomRange(0.4, 0.6),
        color: tank.color,
      });
    }
    explosions.push({ fragments });
    SoundManager.explosion();
  }

  function updateExplosions(dt) {
    for (let i = explosions.length - 1; i >= 0; i--) {
      const explosion = explosions[i];
      let living = 0;
      for (const frag of explosion.fragments) {
        if (frag.life >= frag.lifeTime) continue;
        frag.life += dt;
        frag.x += frag.vx * dt;
        frag.y += frag.vy * dt;
        frag.vx *= 0.9;
        frag.vy *= 0.9;
        frag.size *= 0.985;
        if (frag.life < frag.lifeTime) {
          living++;
        }
      }
      if (living === 0) {
        explosions.splice(i, 1);
      }
    }
  }

  function drawExplosions() {
    for (const explosion of explosions) {
      for (const frag of explosion.fragments) {
        if (frag.life >= frag.lifeTime) continue;
        const progress = frag.life / frag.lifeTime;
        const alpha = 1 - progress;
        const size = Math.max(1, frag.size * (1 - progress * 0.6));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = frag.color;
        ctx.fillRect(frag.x - size / 2, frag.y - size / 2, size, size);
        ctx.restore();
      }
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
    explosions = []; // 新局前清空残留的爆炸碎片
    clearAllInputStates(); // 进入新局前强制松手，避免上一局长按直接继承

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

    // 重置 AI 大脑状态，避免上一局的目标残留
    initAIBrain();
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
    clearAllInputStates(); // 小局落定瞬间清理所有输入状态，3 秒窗口结束后不会带入下一局

    // 一旦小局结果落定，立即清空场上所有子弹，
    // 防止残余子弹飞进下一局，或者影响 3 秒判定之后的新局。
    bullets = [];

    // 关闭 3 秒判定窗口
    roundJudgeTimer = 0;

    // 根据小局结果更新比分（胜者 +1 分，平局不加分）
    if (result === "playerWin") {
      playerScore++;
    } else if (result === "aiWin") {
      aiScore++;
    } else {
      // 平局：可以在这里增加特殊提示 / 音效
    }

    updateHUD();

    // 计分制：有人分数到达目标值则结束整场游戏
    if (currentMode === GameMode.SCORE) {
      if (playerScore >= CONFIG.scoreTarget) {
        endGame(gameMode === "pvp" ? "玩家1 获胜！" : "你赢了！");
        return;
      }
      if (aiScore >= CONFIG.scoreTarget) {
        endGame(gameMode === "pvp" ? "玩家2 获胜！" : "电脑获胜……");
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
    explosions = [];
    clearAllInputStates(); // 整场重置时同步清空按键缓存

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
    gameMode = battleModeSelect ? battleModeSelect.value : "pve";

    menuEl.classList.add("hidden");
    overlayEl.classList.add("hidden");
    hudEl.classList.remove("hidden");

    isPaused = false;
    pauseOverlay.classList.add("hidden");
    resetMatch();
    gameState = "playing";
    pauseBtn.classList.remove("hidden");
    resumeBtn.classList.add("hidden");
    updateCanvasScale();
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

  pauseResumeBtn.addEventListener("click", () => {
    resumeGame();
  });

  pauseMenuBtn.addEventListener("click", () => {
    backToMenu();
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

  // ===== 暂停菜单控制 =====
  function pauseGame() {
    if (gameState !== "playing" || isPaused) return;
    isPaused = true;
    pauseBtn.classList.add("hidden");
    resumeBtn.classList.remove("hidden");
    pauseOverlay.classList.remove("hidden");
  }

  function resumeGame() {
    if (!isPaused) return;
    isPaused = false;
    pauseBtn.classList.remove("hidden");
    resumeBtn.classList.add("hidden");
    pauseOverlay.classList.add("hidden");
    lastTimestamp = performance.now();
  }

  function togglePause() {
    if (isPaused) resumeGame();
    else pauseGame();
  }

  function restartGame() {
    overlayEl.classList.add("hidden");
    hudEl.classList.remove("hidden");
    isPaused = false;
    pauseOverlay.classList.add("hidden");
    resetMatch();
    gameState = "playing";
    pauseBtn.classList.remove("hidden");
    resumeBtn.classList.add("hidden");
    updateCanvasScale(); // 切回对战界面时同步缩放
  }

  function backToMenu() {
    // 返回主界面时确保退出暂停并把对局清空
    isPaused = false;
    pauseOverlay.classList.add("hidden");
    pauseBtn.classList.remove("hidden");
    resumeBtn.classList.add("hidden");
    gameState = "menu";
    overlayEl.classList.add("hidden");
    hudEl.classList.add("hidden");
    menuEl.classList.remove("hidden");
    bullets = [];
    explosions = [];
    playerScore = 0;
    aiScore = 0;
    remainingTime = CONFIG.timeLimit;
    playerTank = null;
    aiTank = null;
    isRoundActive = false;
    pendingRoundResult = null;
    roundJudgeTimer = 0;
    clearAllInputStates(); // 回到菜单同样要清键，避免背景长按
    updateHUD();
    updateCanvasScale();
  }

  // ===== 渲染 =====
  function drawBackground() {
    // 深蓝背景直接铺满画布，外围描边使用半透明的深蓝色，避免出现突兀的黑色硬边框。
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.strokeStyle = COLORS.mazeFrame;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(
      CONFIG.mapPadding - 4,
      CONFIG.mapPadding - 4,
      canvas.width - CONFIG.mapPadding * 2 + 8,
      canvas.height - CONFIG.mapPadding * 2 + 8
    );
    ctx.restore();
  }

  function drawObstacles() {
    for (const o of obstacles) {
      // 迷宫墙体采用统一色板，边缘稍亮
      ctx.fillStyle = COLORS.mazeWall;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = COLORS.mazeOutline;
      ctx.lineWidth = 2;
      ctx.strokeRect(o.x, o.y, o.w, o.h);
    }
  }

  function drawTank(tank) {
    if (!tank || !tank.isAlive) return;

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
    ctx.fillStyle = COLORS.tankBarrel;
    ctx.fillRect(-r * 0.4, -r * 0.4, r * 0.8, r * 0.8);

    // 炮管：默认沿 +X 方向，旋转后就是当前炮口方向
    ctx.fillStyle = COLORS.tankBarrel;
    ctx.fillRect(0, -gunWidth / 2, gunLength, gunWidth);

    // 两侧履带
    ctx.fillStyle = COLORS.tankTread;
    ctx.fillRect(-halfBodyL, -halfBodyW - treadWidth, bodyLength, treadWidth);
    ctx.fillRect(-halfBodyL, halfBodyW, bodyLength, treadWidth);

    ctx.restore();
  }


  function drawBullets() {
    for (const b of bullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      // 子弹统一为黑色实体，配合浅灰描边在深蓝背景上保持可读性
      ctx.fillStyle = COLORS.bullet;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = COLORS.bulletOutline;
      ctx.stroke();
    }
  }

  function render() {
    drawBackground();
    drawObstacles();
    drawBullets();
    drawExplosions();
    drawTank(playerTank);
    drawTank(aiTank);

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

    if (gameState === "playing" && !isPaused) {
      // 计时制：暂停时也需要静止，这里只在未暂停时扣时间
      if (currentMode === GameMode.TIME) {
        remainingTime -= dt;
        if (remainingTime <= 0) {
          remainingTime = 0;
          updateHUD();
          triggerTimeModeEnd();
        }
      }

      // 小局进行中的正常更新：玩家、AI/玩家2、子弹
      updateHumanTank(playerTank, input.player1, "player", dt);
      if (gameMode === "pvp") {
        // PVP：第二辆坦克使用 player2 按键输入
        updateHumanTank(aiTank, input.player2, "ai", dt);
      } else {
        // PVE：保留 AI 逻辑，方便后续继续调优
        updateAI(dt);
      }
      updateBullets(dt);
      updateExplosions(dt);

      // === 3 秒判定窗口处理：第一辆坦克死亡后固定等满 3 秒再判定胜负 ===
      if (roundJudgeTimer > 0) {
        roundJudgeTimer -= dt;
        if (roundJudgeTimer <= 0 && !pendingRoundResult) {
          roundJudgeTimer = 0;
          const playerAlive = playerTank && playerTank.isAlive;
          const aiAlive = aiTank && aiTank.isAlive;
          if (playerAlive && !aiAlive) {
            pendingRoundResult = "playerWin";
          } else if (!playerAlive && aiAlive) {
            pendingRoundResult = "aiWin";
          } else {
            pendingRoundResult = "draw";
          }
        }
      }

      updateHUD();

      // 一旦本帧内已经得出小局结果（双杀/判定窗口结束），统一在这里收尾
      if (pendingRoundResult) {
        const result = pendingRoundResult;
        pendingRoundResult = null;
        endRound(result);
      }
    }


    // 一帧的渲染
    render();

    // 下一帧
    window.requestAnimationFrame(gameLoop);
  }
   window.requestAnimationFrame(gameLoop);
})();
