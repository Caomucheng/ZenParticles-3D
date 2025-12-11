import * as THREE from 'three';
import { ParticleShape } from '../types';
import { PARTICLE_COUNT } from '../constants';

// Helper to get random point on sphere surface
const getRandomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

export const generatePositions = (shape: ParticleShape): Float32Array => {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const tempVec = new THREE.Vector3();

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    let x = 0, y = 0, z = 0;

    switch (shape) {
      case ParticleShape.HEART: {
        // Parametric Heart Equation
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        // z = variation
        const t = Math.random() * Math.PI * 2;
        const scale = 0.8;
        // Spread z to give it volume
        const r = Math.random(); 
        x = 16 * Math.pow(Math.sin(t), 3) * scale;
        y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale;
        z = (Math.random() - 0.5) * 10 * Math.sqrt(Math.abs(x) / 16); // Thicker in middle
        break;
      }

      case ParticleShape.FLOWER: {
        // Rose curve inspired
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        // Petal shape factor
        const k = 4; 
        const r = 10 * Math.sin(k * theta) + 5;
        
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = (r * Math.cos(phi)) * 0.3; // Flattish flower
        break;
      }

      case ParticleShape.SATURN: {
        const rand = Math.random();
        if (rand < 0.4) {
          // Planet Body
          const p = getRandomSpherePoint(8);
          x = p.x; y = p.y; z = p.z;
        } else {
          // Rings
          const angle = Math.random() * Math.PI * 2;
          // Ring radius between 11 and 20
          const dist = 11 + Math.random() * 9;
          x = Math.cos(angle) * dist;
          z = Math.sin(angle) * dist;
          y = (Math.random() - 0.5) * 0.5; // Very flat
          
          // Tilt the rings
          const tilt = Math.PI / 6;
          const _x = x;
          const _y = y * Math.cos(tilt) - z * Math.sin(tilt);
          const _z = y * Math.sin(tilt) + z * Math.cos(tilt);
          x = _x; y = _y; z = _z;
        }
        break;
      }

      case ParticleShape.BUDDHA: {
        // Simplified Meditating Figure using primitives
        const rand = Math.random();
        if (rand < 0.25) {
          // Head
          const p = getRandomSpherePoint(3.5);
          x = p.x; y = p.y + 6; z = p.z;
        } else if (rand < 0.65) {
          // Body (Ovular)
          const p = getRandomSpherePoint(5);
          x = p.x * 1.2; y = p.y * 1.1 - 1; z = p.z * 0.8;
        } else {
          // Legs/Base (Wide and flat)
          const p = getRandomSpherePoint(6);
          x = p.x * 1.8; y = p.y * 0.5 - 6; z = p.z * 1.5;
        }
        break;
      }

      case ParticleShape.FIREWORKS: {
        const p = getRandomSpherePoint(Math.random() * 20);
        x = p.x; y = p.y; z = p.z;
        break;
      }

      case ParticleShape.SPHERE:
      default: {
        const p = getRandomSpherePoint(12);
        x = p.x; y = p.y; z = p.z;
        break;
      }
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
  }

  return positions;
};