import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { VISION_BASE_PATH } from "../constants";

let handLandmarker: HandLandmarker | undefined;

export const initializeHandLandmarker = async (): Promise<void> => {
  if (handLandmarker) return;

  try {
    const vision = await FilesetResolver.forVisionTasks(VISION_BASE_PATH);
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 2
    });
    console.log("HandLandmarker initialized");
  } catch (error) {
    console.error("Error initializing HandLandmarker:", error);
    throw error;
  }
};

export const detectHands = (video: HTMLVideoElement, timestamp: number): HandLandmarkerResult | null => {
  if (!handLandmarker) return null;
  return handLandmarker.detectForVideo(video, timestamp);
};