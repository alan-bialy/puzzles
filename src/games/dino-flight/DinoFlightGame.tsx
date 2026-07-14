import { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "../../app/providers/SettingsContext";
import { dinoFlightConfig as config } from "./config/dinoFlightConfig";
import { trackEvent } from "../../shared/analytics/trackEvent";

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
  backgroundOffset: number;
};

const BEST_SCORE_STORAGE_KEY = "puzzles.dino-flight.best-score";

type DinoFlightAssets = {
  background: HTMLImageElement;
  wall: HTMLImageElement;
  dinoFrames: [HTMLImageElement, HTMLImageElement, HTMLImageElement];
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
  const [background, wall, dinoFrameOne, dinoFrameTwo, dinoFrameThree] =
    await Promise.all([
      loadImage(config.assets.background),
      loadImage(config.assets.wall),
      loadImage(config.assets.dinoFrames[0]),
      loadImage(config.assets.dinoFrames[1]),
      loadImage(config.assets.dinoFrames[2]),
    ]);

  return {
    background,
    wall,
    dinoFrames: [dinoFrameOne, dinoFrameTwo, dinoFrameThree],
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
    backgroundOffset: 0,
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
  model.backgroundOffset = 0;
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

function drawScrollingBackground(
  ctx: CanvasRenderingContext2D,
  backgroundImage: HTMLImageElement | undefined,
  offset: number,
) {
  if (!backgroundImage) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
    return;
  }

  const imageWidth = backgroundImage.naturalWidth || backgroundImage.width;
  const imageHeight = backgroundImage.naturalHeight || backgroundImage.height;

  if (imageWidth <= 0 || imageHeight <= 0) {
    return;
  }

  const coverScale =
    Math.max(
      config.canvasWidth / imageWidth,
      config.canvasHeight / imageHeight,
    ) * config.backgroundZoom;

  const drawWidth = imageWidth * coverScale;
  const drawHeight = imageHeight * coverScale;

  const drawY = (config.canvasHeight - drawHeight) / 2;

  const normalizedOffset = ((offset % drawWidth) + drawWidth) % drawWidth;

  ctx.save();

  ctx.imageSmoothingEnabled = true;

  ctx.drawImage(
    backgroundImage,
    -drawWidth + normalizedOffset,
    drawY,
    drawWidth,
    drawHeight,
  );

  ctx.drawImage(
    backgroundImage,
    normalizedOffset,
    drawY,
    drawWidth,
    drawHeight,
  );

  ctx.drawImage(
    backgroundImage,
    drawWidth + normalizedOffset,
    drawY,
    drawWidth,
    drawHeight,
  );

  if (config.backgroundOverlayOpacity > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${config.backgroundOverlayOpacity})`;
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
  }

  ctx.restore();
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

  if (config.wallBorderWidth > 0) {
    ctx.strokeStyle = config.wallBorderColor;
    ctx.lineWidth = config.wallBorderWidth;

    const inset = config.wallBorderWidth / 2;

    ctx.strokeRect(
      wall.x + inset,
      y + inset,
      config.wallWidth - config.wallBorderWidth,
      height - config.wallBorderWidth,
    );
  }
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

function getDinoFrameIndex(model: GameModel, time: number) {
  if (model.phase !== "playing") {
    return 0;
  }

  const elapsedSinceFlap = time - model.lastFlapTime;

  if (elapsedSinceFlap < 0 || elapsedSinceFlap > config.flapFrameDurationMs) {
    return 0;
  }

  const progress = elapsedSinceFlap / config.flapFrameDurationMs;

  if (progress < 0.33) {
    return 1;
  }

  if (progress < 0.66) {
    return 2;
  }

  return 1;
}

function drawDino(
  ctx: CanvasRenderingContext2D,
  model: GameModel,
  time: number,
  assets: DinoFlightAssets | null,
) {
  const frameIndex = getDinoFrameIndex(model, time);
  const frame = assets?.dinoFrames[frameIndex];

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
  drawScrollingBackground(ctx, assets?.background, model.backgroundOffset);

  ctx.imageSmoothingEnabled = false;

  drawWalls(ctx, model.walls, assets);
  drawDino(ctx, model, time, assets);
}

function updateGame(model: GameModel, frameScale: number) {
  if (model.phase !== "playing") {
    return;
  }

  const backgroundDirectionMultiplier =
    config.backgroundDirection === "left-to-right" ? 1 : -1;

  model.backgroundOffset +=
    backgroundDirectionMultiplier *
    config.backgroundSpeed *
    (1000 / 60) *
    frameScale;

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

    trackEvent("dino_flight_game_over", {
      score: model.score,
      bestScore: Math.max(model.bestScore, model.score),
    });

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
          title: "Flappy Dino",
          description:
            "Kliknij albo naciśnij spację, aby wzbić dinozaura w górę",
          ready: "Kliknij, aby zacząć",
          gameOver: "Koniec gry",
          restart: "Kliknij, aby zagrać ponownie",
          score: "Wynik",
          best: "Rekord",
        }
      : {
          title: "Flappy Dino",
          description: "Click or press space to make the dinosaur fly",
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
        className="relative w-full max-w-sm touch-manipulation overflow-hidden rounded-3xl border border-white/20 bg-black shadow-2xl outline-none active:scale-[0.996]"
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
