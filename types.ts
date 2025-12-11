export enum ParticleShape {
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  BUDDHA = 'Buddha',
  FIREWORKS = 'Fireworks',
  SPHERE = 'Sphere'
}

export interface AppState {
  currentShape: ParticleShape;
  particleColor: string;
  particleSize: number;
  interactionFactor: number; // 0 to 1 (Closed to Open)
  isHandDetected: boolean;
}

export interface HandTrackingResult {
  isDetected: boolean;
  openness: number; // 0.0 (closed/pinch) to 1.0 (open/spread)
}