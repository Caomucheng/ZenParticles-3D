import React from 'react';
import { ParticleShape } from '../types';
import { DEFAULT_COLOR } from '../constants';

interface UIProps {
  currentShape: ParticleShape;
  setShape: (s: ParticleShape) => void;
  currentColor: string;
  setColor: (c: string) => void;
  isHandDetected: boolean;
  interactionFactor: number;
}

const UI: React.FC<UIProps> = ({ 
  currentShape, 
  setShape, 
  currentColor, 
  setColor, 
  isHandDetected,
  interactionFactor
}) => {
  
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
      
      {/* Header */}
      <div className="flex justify-end pointer-events-auto">
        <button 
          onClick={toggleFullScreen}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium transition-colors border border-white/10"
        >
          Full Screen
        </button>
      </div>

      {/* Status Indicator */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold tracking-wider text-white drop-shadow-lg">ZEN PARTICLES</h1>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border transition-colors duration-500
          ${isHandDetected 
            ? 'bg-green-500/20 border-green-400/50 text-green-200' 
            : 'bg-red-500/20 border-red-400/50 text-red-200'
          }`}
        >
          {isHandDetected ? `Hands Active (${Math.round(interactionFactor * 100)}%)` : 'Detecting Hands...'}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col md:flex-row gap-6 items-end md:items-center justify-between pointer-events-auto bg-black/30 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
        
        {/* Shape Selectors */}
        <div className="flex flex-wrap gap-2">
          {Object.values(ParticleShape).map((shape) => (
            <button
              key={shape}
              onClick={() => setShape(shape)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105
                ${currentShape === shape 
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
            >
              {shape}
            </button>
          ))}
        </div>

        {/* Color Picker */}
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
          <label className="text-sm text-white/80">Color</label>
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/30 cursor-pointer">
            <input 
              type="color" 
              value={currentColor}
              onChange={(e) => setColor(e.target.value)}
              className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" 
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default UI;