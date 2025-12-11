import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { ParticleShape } from '../types';
import { generatePositions } from '../utils/shapeGenerator';
import { ANIMATION_SPEED, PARTICLE_COUNT, CAMERA_Z_POS } from '../constants';

interface ThreeSceneProps {
  currentShape: ParticleShape;
  color: string;
  interactionFactor: number; // 0.0 to ~2.0
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ currentShape, color, interactionFactor }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Persistent refs to avoid re-instantiation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const materialRef = useRef<THREE.PointsMaterial | null>(null);
  
  // Data refs for animation
  const targetPositionsRef = useRef<Float32Array | null>(null);
  const currentPositionsRef = useRef<Float32Array | null>(null);
  const originalPositionsRef = useRef<Float32Array | null>(null); // To store base shape before expansion
  const reqIdRef = useRef<number>(0);

  // Mutable ref to track interaction factor inside the animation loop without stale closures
  const interactionFactorRef = useRef(interactionFactor);
  // Mutable ref for smooth scaling (moved out of animate loop to fix React Error #321)
  const currentScaleRef = useRef<number>(1);

  // Sync prop to ref
  useEffect(() => {
    interactionFactorRef.current = interactionFactor;
  }, [interactionFactor]);

  // Initialize Scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = CAMERA_Z_POS;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Particles Setup
    const geometry = new THREE.BufferGeometry();
    const positions = generatePositions(ParticleShape.SPHERE); // Start with sphere
    
    // Store data
    currentPositionsRef.current = new Float32Array(positions);
    targetPositionsRef.current = new Float32Array(positions);
    originalPositionsRef.current = new Float32Array(positions);

    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositionsRef.current, 3));
    geometryRef.current = geometry;

    // Material
    // Create a circular texture on the fly for better look
    const sprite = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/spark1.png');

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.8,
      map: sprite,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      opacity: 0.8
    });
    materialRef.current = material;

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Resize Handler
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);

      if (sceneRef.current && cameraRef.current && rendererRef.current && geometryRef.current) {
        const positions = geometryRef.current.attributes.position.array as Float32Array;
        const targets = targetPositionsRef.current;
        const originals = originalPositionsRef.current;
        
        // Time for rotation
        const time = Date.now() * 0.0005;
        sceneRef.current.rotation.y = time * 0.2;
        sceneRef.current.rotation.x = time * 0.05;

        // Interaction Morphing
        // Get latest factor from ref to avoid stale closure
        const factor = interactionFactorRef.current;

        // Map interactionFactor (usually 0 to 1 from detector) to a scale
        // Detector returns: 0 (closed) to 1 (open).
        let targetScale = 1;
        if (factor < 0.5) {
            targetScale = 0.2 + (factor / 0.5) * 0.8; // 0.2 to 1
        } else {
            targetScale = 1 + ((factor - 0.5) / 0.5) * 2.0; // 1 to 3
        }
        
        // Smoothly interpolate scale
        currentScaleRef.current += (targetScale - currentScaleRef.current) * 0.1;
        const scale = currentScaleRef.current;

        for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
          if (!targets || !originals) continue;

          // 1. Interpolate towards target shape
          const diff = targets[i] - originals[i];
          originals[i] += diff * ANIMATION_SPEED;

          // 2. Apply Interaction Scale
          // Current desired position is originals[i] * scale
          const desired = originals[i] * scale;
          
          // Lerp current position to desired interaction position
          const currentDiff = desired - positions[i];
          positions[i] += currentDiff * 0.1; // Smooth camera reaction
        }

        geometryRef.current.attributes.position.needsUpdate = true;
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqIdRef.current);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      geometry.dispose();
      material.dispose();
      sprite.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Update Target Shape
  useEffect(() => {
    if (targetPositionsRef.current) {
      targetPositionsRef.current = generatePositions(currentShape);
    }
  }, [currentShape]);

  // Update Color
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color.set(color);
    }
  }, [color]);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
};

export default ThreeScene;