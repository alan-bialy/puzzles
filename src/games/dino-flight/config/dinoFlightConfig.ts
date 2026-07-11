export type DinoFlightConfig = {
  canvasWidth: number
  canvasHeight: number

  gravity: number
  flapVelocity: number
  maxFallVelocity: number

  dinoX: number
  dinoWidth: number
  dinoHeight: number
  flapFrameDurationMs: number

  wallWidth: number
  wallGapHeight: number
  wallSpacing: number
  wallSpeed: number
  wallTextureScale: number

  minGapTop: number
  bottomPadding: number

  pixelSize: number

  assets: {
    wall: string
    dinoFrames: [string, string]
  }
}

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
  flapFrameDurationMs: 160,

  wallWidth: 56,
  wallGapHeight: 150,
  wallSpacing: 220,
  wallSpeed: 2.75,
  wallTextureScale: 0.12,

  minGapTop: 72,
  bottomPadding: 36,

  pixelSize: 6,

  assets: {
    wall: 'assets/dino-flight/wall1.png',
    dinoFrames: [
      'assets/dino-flight/dino1.png',
      'assets/dino-flight/dino2.png',
    ],
  },
}