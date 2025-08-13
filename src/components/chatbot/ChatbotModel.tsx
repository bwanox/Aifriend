'use client';

import * as THREE from 'three';
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { type Emotion } from '@/lib/types';

const coreMaterial = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  roughness: 0.1,
  metalness: 0.9,
  emissive: '#9c33ff',
  emissiveIntensity: 0,
});

const ringMaterial = new THREE.MeshStandardMaterial({
  color: '#9c33ff',
  roughness: 0.2,
  metalness: 0.5,
  emissive: '#9c33ff',
  emissiveIntensity: 1,
});

const emotionConfig = {
    idle: { speed: 0.5, intensity: 2 },
    happy: { speed: 2, intensity: 5 },
    sad: { speed: 0.2, intensity: 0.5 },
    thinking: { speed: 1, intensity: 3 },
    surprised: { speed: 3, intensity: 8 },
};

export default function ChatbotModel({ emotion, isSpeaking }: ChatbotModelProps) {
  const group = useRef<THREE.Group>(null!);
  const core = useRef<THREE.Mesh>(null!);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  
  const tempObject = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!group.current || !core.current) return;
    
    const t = state.clock.getElapsedTime();
    const config = emotionConfig[emotion] || emotionConfig.idle;

    // Smooth bobbing animation
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, Math.sin(t * 1.5) * 0.1, 0.05);

    // Update core emissive intensity based on emotion and speaking state
    const targetIntensity = isSpeaking ? config.intensity * 1.5 : config.intensity;
    coreMaterial.emissiveIntensity = THREE.MathUtils.lerp(coreMaterial.emissiveIntensity, targetIntensity, 0.1);

    // Rotate rings
    rings.current.forEach((ring, i) => {
        if (ring) {
            const speedFactor = isSpeaking ? config.speed * 2 : config.speed;
            const yRot = t * speedFactor * (i % 2 === 0 ? 0.2 : -0.2);
            const zRot = t * speedFactor * 0.15 * (i % 2 === 0 ? -1 : 1);
            ring.rotation.set(0, yRot, zRot);

            const scale = 1 + Math.sin(t * speedFactor * 0.5 + i) * 0.05;
            ring.scale.set(scale, scale, scale);
        }
    });

  });

  return (
    <group ref={group} dispose={null} position={[0, 0.5, 0]} castShadow receiveShadow>
      <mesh ref={core} material={coreMaterial} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
      </mesh>
      
      {[...Array(4)].map((_, i) => (
        <mesh 
          key={i} 
          ref={el => rings.current[i] = el}
          material={ringMaterial} 
          rotation-x={Math.PI / 2}
        >
          <ringGeometry args={[0.6 + i * 0.1, 0.62 + i * 0.1, 64]} />
        </mesh>
      ))}

    </group>
  );
}

type ChatbotModelProps = {
  emotion: Emotion;
  isSpeaking: boolean;
};
