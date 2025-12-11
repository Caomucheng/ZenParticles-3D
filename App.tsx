import React, { useState, useCallback } from 'react';
import ThreeScene from './components/ThreeScene';
import HandController from './components/HandController';
import UI from './components/UI';
import { ParticleShape } from './types';
import { DEFAULT_COLOR } from './constants';

const App: React.FC = () => {
  const [currentShape, setShape] = useState<ParticleShape>(ParticleShape.HEART);
  const [particleColor, setParticleColor] = useState<string>(DEFAULT_COLOR);
  const [interactionFactor, setInteractionFactor] = useState<number>(0.5);
  const [isHandDetected, setIsHandDetected] = useState<boolean>(false);

  // Optimized callback to update state from animation frame loop
  const handleInteractionUpdate = useCallback((factor: number, isDetected: boolean) => {
    // Smooth out the factor slightly to prevent jitter
    setInteractionFactor(prev => prev + (factor - prev) * 0.1);
    setIsHandDetected(isDetected);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-sans">
      
      {/* 3D Scene Layer */}
      <ThreeScene 
        currentShape={currentShape} 
        color={particleColor} 
        interactionFactor={interactionFactor} 
      />

      {/* Logic Layer (Invisible/Minimally visible) */}
      <HandController onInteractionUpdate={handleInteractionUpdate} />

      {/* UI Layer */}
      <UI 
        currentShape={currentShape}
        setShape={setShape}
        currentColor={particleColor}
        setColor={setParticleColor}
        isHandDetected={isHandDetected}
        interactionFactor={interactionFactor}
      />
      
    </div>
  );
};

export default App;