import { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "../../app/providers/SettingsContext";
import { dinoFlightConfig as config } from "./config/dinoFlightConfig";

type GamePhase = "ready" | "playing" | "game-over";

type Wall = {
  x: number;
  gapTop: number;
  scored: boolean;
  textureOffsetX: number;
  textureOffsetY: number;
};

type GameModel = {
  phase: GamePhase;
  dinoY: number;
  velocity: number;
  walls: Wall[];
  score: number;
  bestScore: number;
  lastFrameTime: number;
  lastFlapTime: number;
};

const BEST_SCORE_STORAGE_KEY = "puzzles.dino-flight.best-score";

type DinoFlightAssets = {
  wall: HTMLImageElement;
  dinoFrames: [HTMLImageElement, HTMLImageElement];
};

function getAssetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path}`;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Cannot load image: ${src}`));
    image.src = getAssetUrl(src);
  });
}

async function loadDinoFlightAssets(): Promise<DinoFlightAssets> {
  const [wall, dinoFrameOne, dinoFrameTwo] = await Promise.all([
    loadImage(config.assets.wall),
    loadImage(config.assets.dinoFrames[0]),
    loadImage(config.assets.dinoFrames[1]),
  ]);

  return {
    wall,
    dinoFrames: [dinoFrameOne, dinoFrameTwo],
  };
}

function getRandomGapTop() {
  const maxGapTop =
    config.canvasHeight - config.bottomPadding - config.wallGapHeight;

  return config.minGapTop + Math.random() * (maxGapTop - config.minGapTop);
}

function createWall(x: number): Wall {
  return {
    x,
    gapTop: getRandomGapTop(),
    scored: false,
    textureOffsetX: Math.random() * 1000,
    textureOffsetY: Math.random() * 1000,
  };
}

function readBestScore() {
  try {
    return Number(localStorage.getItem(BEST_SCORE_STORAGE_KEY) ?? 0);
  } catch {
    return 0;
  }
}

function saveBestScore(score: number) {
  try {
    localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(score));
  } catch {
    // Best score is optional.
  }
}

function createInitialModel(): GameModel {
  return {
    phase: "ready",
    dinoY: config.canvasHeight / 2 - config.dinoHeight / 2,
    velocity: 0,
    walls: [
      createWall(config.canvasWidth + 120),
      createWall(config.canvasWidth + 120 + config.wallSpacing),
      createWall(config.canvasWidth + 120 + config.wallSpacing * 2),
    ],
    score: 0,
    bestScore: readBestScore(),
    lastFrameTime: 0,
    lastFlapTime: 0,
  };
}

function resetModel(model: GameModel, phase: GamePhase = "ready") {
  model.phase = phase;
  model.dinoY = config.canvasHeight / 2 - config.dinoHeight / 2;
  model.velocity = 0;
  model.score = 0;
  model.walls = [
    createWall(config.canvasWidth + 120),
    createWall(config.canvasWidth + 120 + config.wallSpacing),
    createWall(config.canvasWidth + 120 + config.wallSpacing * 2),
  ];
  model.lastFlapTime = 0;
}

function doesDinoHitWall(model: GameModel) {
  const dinoLeft = config.dinoX;
  const dinoRight = config.dinoX + config.dinoWidth;
  const dinoTop = model.dinoY;
  const dinoBottom = model.dinoY + config.dinoHeight;

  if (dinoTop <= 0 || dinoBottom >= config.canvasHeight) {
    return true;
  }

  return model.walls.some((wall) => {
    const wallLeft = wall.x;
    const wallRight = wall.x + config.wallWidth;

    const overlapsX = dinoRight > wallLeft && dinoLeft < wallRight;

    if (!overlapsX) {
      return false;
    }

    const gapBottom = wall.gapTop + config.wallGapHeight;

    return dinoTop < wall.gapTop || dinoBottom > gapBottom;
  });
}

function drawPixelBackground(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";

  for (let x = 0; x < config.canvasWidth; x += 24) {
    const offset = (time / 24 + x * 3) % config.canvasHeight;

    for (let y = -config.canvasHeight; y < config.canvasHeight; y += 72) {
      ctx.fillRect(x, y + offset, 3, 8);
    }
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;

  for (let y = 0; y < config.canvasHeight; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(config.canvasWidth, y);
    ctx.stroke();
  }
}

function drawTiledImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  offsetX: number,
  offsetY: number,
) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;

  if (sourceWidth <= 0 || sourceHeight <= 0) {
    return;
  }

  const tileWidth = sourceWidth * config.wallTextureScale;
  const tileHeight = sourceHeight * config.wallTextureScale;

  ctx.save();

  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  const startX = x - (offsetX % tileWidth);
  const startY = y - (offsetY % tileHeight);

  for (let tileY = startY; tileY < y + height; tileY += tileHeight) {
    for (let tileX = startX; tileX < x + width; tileX += tileWidth) {
      ctx.drawImage(image, tileX, tileY, tileWidth, tileHeight);
    }
  }

  ctx.restore();
}

function drawTexturedWall(
  ctx: CanvasRenderingContext2D,
  wallImage: HTMLImageElement,
  wall: Wall,
  y: number,
  height: number,
) {
  drawTiledImage(
    ctx,
    wallImage,
    wall.x,
    y,
    config.wallWidth,
    height,
    wall.textureOffsetX,
    wall.textureOffsetY + y,
  );
}

function drawWalls(
  ctx: CanvasRenderingContext2D,
  walls: Wall[],
  assets: DinoFlightAssets | null,
) {
  walls.forEach((wall) => {
    const topWallHeight = wall.gapTop;
    const bottomWallY = wall.gapTop + config.wallGapHeight;
    const bottomWallHeight = config.canvasHeight - bottomWallY;

    if (assets) {
      drawTexturedWall(ctx, assets.wall, wall, 0, topWallHeight);

      drawTexturedWall(ctx, assets.wall, wall, bottomWallY, bottomWallHeight);

      return;
    }

    ctx.fillStyle = "#fff";
    ctx.fillRect(wall.x, 0, config.wallWidth, topWallHeight);
    ctx.fillRect(wall.x, bottomWallY, config.wallWidth, bottomWallHeight);
  });
}

function drawDino(
  ctx: CanvasRenderingContext2D,
  model: GameModel,
  time: number,
  assets: DinoFlightAssets | null,
) {
  const useFlapFrame =
    model.phase === "playing" &&
    time - model.lastFlapTime < config.flapFrameDurationMs;

  const frame = assets?.dinoFrames[useFlapFrame ? 1 : 0];

  if (!frame) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(
      config.dinoX,
      model.dinoY,
      config.dinoWidth,
      config.dinoHeight,
    );
    return;
  }

  ctx.drawImage(
    frame,
    config.dinoX,
    model.dinoY,
    config.dinoWidth,
    config.dinoHeight,
  );
}

function drawGame(
  ctx: CanvasRenderingContext2D,
  model: GameModel,
  time: number,
  assets: DinoFlightAssets | null,
) {
  drawPixelBackground(ctx, time);
  drawWalls(ctx, model.walls, assets);
  drawDino(ctx, model, time, assets);
}
function updateGame(model: GameModel, frameScale: number) {
  if (model.phase !== "playing") {
    return;
  }

  model.velocity = Math.min(
    model.velocity + config.gravity * frameScale,
    config.maxFallVelocity,
  );

  model.dinoY += model.velocity * frameScale;

  model.walls.forEach((wall) => {
    wall.x -= config.wallSpeed * frameScale;

    if (!wall.scored && wall.x + config.wallWidth < config.dinoX) {
      wall.scored = true;
      model.score += 1;
    }
  });

  const firstWall = model.walls[0];

  if (firstWall && firstWall.x + config.wallWidth < -20) {
    model.walls.shift();

    const lastWall = model.walls.at(-1);

    model.walls.push(
      createWall((lastWall?.x ?? config.canvasWidth) + config.wallSpacing),
    );
  }

  if (doesDinoHitWall(model)) {
    model.phase = "game-over";

    if (model.score > model.bestScore) {
      model.bestScore = model.score;
      saveBestScore(model.score);
    }
  }
}

export function DinoFlightGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const assetsRef = useRef<DinoFlightAssets | null>(null);

  const [initialModel] = useState(createInitialModel);
  const modelRef = useRef<GameModel>(initialModel);

  const [phase, setPhase] = useState<GamePhase>(initialModel.phase);
  const [score, setScore] = useState(initialModel.score);
  const [bestScore, setBestScore] = useState(initialModel.bestScore);

  const { language } = useSettings();

  const text =
    language === "pl"
      ? {
          title: "Dino Flight",
          description: "Kliknij albo wciśnij spację, żeby poderwać dinozaura.",
          ready: "Kliknij, żeby zacząć",
          gameOver: "Koniec gry",
          restart: "Kliknij, żeby zagrać ponownie",
          score: "Wynik",
          best: "Rekord",
        }
      : {
          title: "Dino Flight",
          description: "Click or press space to lift the dinosaur.",
          ready: "Click to start",
          gameOver: "Game over",
          restart: "Click to play again",
          score: "Score",
          best: "Best",
        };

  const syncUiState = useCallback(() => {
    const model = modelRef.current;

    setPhase(model.phase);
    setScore(model.score);
    setBestScore(model.bestScore);
  }, []);

  const flap = useCallback(() => {
    const model = modelRef.current;

    const now = performance.now();
    model.lastFlapTime = now;

    if (model.phase === "ready") {
      resetModel(model, "playing");
      model.velocity = config.flapVelocity;
      syncUiState();
      return;
    }

    if (model.phase === "game-over") {
      resetModel(model, "playing");
      model.velocity = config.flapVelocity;
      syncUiState();
      return;
    }

    model.velocity = config.flapVelocity;
  }, [syncUiState]);

  useEffect(() => {
    let isActive = true;

    async function loadAssets() {
      try {
        const assets = await loadDinoFlightAssets();

        if (!isActive) {
          return;
        }

        assetsRef.current = assets;
      } catch {
        assetsRef.current = null;
      }
    }

    void loadAssets();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement) {
      return;
    }

    const renderingContext = canvasElement.getContext("2d");

    if (!renderingContext) {
      return;
    }

    const canvas = canvasElement;
    const ctx = renderingContext;

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = config.canvasWidth * dpr;
      canvas.height = config.canvasHeight * dpr;

      canvas.style.aspectRatio = `${config.canvasWidth} / ${config.canvasHeight}`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    }

    function loop(time: number) {
      const model = modelRef.current;

      if (!model.lastFrameTime) {
        model.lastFrameTime = time;
      }

      const deltaMs = Math.min(time - model.lastFrameTime, 32);
      const frameScale = deltaMs / (1000 / 60);

      model.lastFrameTime = time;

      updateGame(model, frameScale);
      drawGame(ctx, model, time, assetsRef.current);

      setScore((currentScore) =>
        currentScore === model.score ? currentScore : model.score,
      );

      setBestScore((currentBestScore) =>
        currentBestScore === model.bestScore
          ? currentBestScore
          : model.bestScore,
      );

      setPhase((currentPhase) =>
        currentPhase === model.phase ? currentPhase : model.phase,
      );

      animationFrameRef.current = window.requestAnimationFrame(loop);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    animationFrameRef.current = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resizeCanvas);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code !== "Space" && event.code !== "ArrowUp") {
        return;
      }

      event.preventDefault();
      flap();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [flap]);

  return (
    <section className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center">
      <div className="mb-5 text-center">
        <h1 className="text-3xl font-black tracking-tight">{text.title}</h1>

        <p className="mt-2 text-sm leading-6 text-(--color-muted)">
          {text.description}
        </p>
      </div>

      <div className="mb-3 flex w-full max-w-sm items-center justify-between rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm font-black">
        <span>
          {text.score}: {score}
        </span>

        <span>
          {text.best}: {bestScore}
        </span>
      </div>

      <button
        type="button"
        onPointerDown={flap}
        className="relative w-full max-w-sm touch-manipulation overflow-hidden rounded-3xl border border-white/20 bg-black shadow-2xl outline-none active:scale-[0.99]"
      >
        <canvas
          ref={canvasRef}
          className="block w-full select-none"
          aria-label={text.title}
        />

        {phase !== "playing" && (
          <div className="absolute inset-0 grid place-items-center bg-black/50 px-6 text-center text-white">
            <div>
              <p className="text-3xl font-black uppercase tracking-tight">
                {phase === "ready" ? text.ready : text.gameOver}
              </p>

              <p className="mt-3 text-sm font-bold text-white/75">
                {phase === "ready" ? text.description : text.restart}
              </p>
            </div>
          </div>
        )}
      </button>

      <p className="mt-4 text-center text-xs font-semibold text-(--color-muted)">
        Space / ↑ / Tap
      </p>
    </section>
  );
}
