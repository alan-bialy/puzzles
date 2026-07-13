export type DinoFlightConfig = {
  canvasWidth: number;
  canvasHeight: number;

  gravity: number;
  flapVelocity: number;
  maxFallVelocity: number;

  dinoX: number;
  dinoWidth: number;
  dinoHeight: number;
  flapFrameDurationMs: number;

  wallWidth: number;
  wallGapHeight: number;
  wallSpacing: number;
  wallSpeed: number;
  wallTextureScale: number;

  backgroundSpeed: number;
  backgroundZoom: number;
  backgroundDirection: "left-to-right" | "right-to-left";
  backgroundOverlayOpacity: number;

  minGapTop: number;
  bottomPadding: number;

  pixelSize: number;

  wallBorderWidth: number;
  wallBorderColor: string;

  assets: {
    background: string;
    wall: string;
    dinoFrames: [string, string, string];
  };
};

export const dinoFlightConfig: DinoFlightConfig = {
  canvasWidth: 360,
  canvasHeight: 560,

  gravity: 0.42,
  flapVelocity: -7.4,
  maxFallVelocity: 9,

  dinoX: 78,
  dinoWidth: 52,
  dinoHeight: 43,
  //   dinoWidth: 46,
  //   dinoHeight: 38,
  flapFrameDurationMs: 190,

  backgroundSpeed: 0.045,
  backgroundZoom: 3.08,
  backgroundDirection: "right-to-left",
  backgroundOverlayOpacity: 0.22,

  minGapTop: 72,
  bottomPadding: 36,

  pixelSize: 6,

  wallBorderWidth: 1,
  wallBorderColor: "rgba(0, 0, 0, 0.9)",

  wallWidth: 56,
  wallGapHeight: 150,
  wallSpacing: 220,
  wallSpeed: 2.75,
  wallTextureScale: 0.12,


  assets: {
    background: "assets/dino-flight/bg1.png",
    wall: "assets/dino-flight/wall2.png",
    dinoFrames: [
      "assets/dino-flight/dd1.png",
      "assets/dino-flight/dd2.png",
      "assets/dino-flight/dd2.png",
    ],
  },
};
