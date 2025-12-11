import React, { useEffect, useRef, useState } from 'react';
import { initializeHandLandmarker, detectHands } from '../services/visionService';

interface HandControllerProps {
  onInteractionUpdate: (factor: number, isDetected: boolean) => void;
}

const HandController: React.FC<HandControllerProps> = ({ onInteractionUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const startCamera = async () => {
      try {
        await initializeHandLandmarker();
        
        if (!active) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: 640,
            height: 480 
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", predictWebcam);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Camera access denied or failed to load AI model.");
        setLoading(false);
      }
    };

    startCamera();

    return () => {
      active = false;
      cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const predictWebcam = () => {
    if (!videoRef.current) return;
    
    const nowInMs = Date.now();
    const result = detectHands(videoRef.current, nowInMs);

    if (result && result.landmarks && result.landmarks.length > 0) {
      let factor = 0.5; // Default neutral

      if (result.landmarks.length === 2) {
        // Two hands detected: Calculate distance between wrists (landmark 0)
        const hand1Wrist = result.landmarks[0][0];
        const hand2Wrist = result.landmarks[1][0];

        // Simple Euclidean distance in normalized coords (0-1)
        const dx = hand1Wrist.x - hand2Wrist.x;
        const dy = hand1Wrist.y - hand2Wrist.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Map distance (approx 0.1 to 0.8) to factor (0 to 1)
        // 0.2 is close, 0.6 is far
        factor = Math.min(Math.max((dist - 0.1) * 2, 0), 1);
      } else if (result.landmarks.length === 1) {
        // One hand: Pinch detection (Thumb tip 4 and Index tip 8)
        const thumbTip = result.landmarks[0][4];
        const indexTip = result.landmarks[0][8];

        const dx = thumbTip.x - indexTip.x;
        const dy = thumbTip.y - indexTip.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        // Map pinch distance (0.02 to 0.2) to factor
        // 0.02 is pinched (closed), 0.2 is open palm
        factor = Math.min(Math.max((dist - 0.02) * 5, 0), 1);
      }

      onInteractionUpdate(factor, true);
    } else {
      onInteractionUpdate(0.5, false);
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="absolute top-4 left-4 z-50">
      <div className="relative w-32 h-24 rounded-lg overflow-hidden border-2 border-white/20 bg-black/50 shadow-lg">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
            Loading AI...
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-red-400 p-2 text-center">
            {error}
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transform -scale-x-100 ${loading ? 'opacity-0' : 'opacity-80'}`}
        />
        <div className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-white/80 bg-black/40">
           Camera Input
        </div>
      </div>
    </div>
  );
};

export default HandController;