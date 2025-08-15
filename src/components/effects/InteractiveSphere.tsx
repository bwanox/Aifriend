'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useAppContext } from '@/contexts/AppContext';
import { themes } from '@/lib/themes';

export default function InteractiveSphere() {
  const { state } = useAppContext();
  const sphereRef = useRef<THREE.Mesh>(null);
  const currentTheme = themes[state.currentTheme];

  useFrame((frameState) => {
    if (!sphereRef.current) return;

    const time = frameState.clock.elapsedTime;

    // Rotate based on conversation activity
    sphereRef.current.rotation.x = time * 0.1;
    sphereRef.current.rotation.y = time * 0.15;

    // Scale based on emotion
    const baseScale = state.botEmotion === 'happy' ? 1.2 :
                     state.botEmotion === 'excited' ? 1.4 :
                     state.botEmotion === 'sad' ? 0.8 : 1;

    sphereRef.current.scale.setScalar(baseScale + Math.sin(time * 2) * 0.1);

    // Color pulsing
    const material = sphereRef.current.material as THREE.MeshStandardMaterial;
    if (material) {
      const intensity = 0.5 + Math.sin(time * 3) * 0.3;
      material.emissiveIntensity = intensity;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[0.3, 32, 32]} position={[2, 1, -1]}>
      <meshStandardMaterial
        color={currentTheme.colors.accent}
        emissive={currentTheme.colors.primary}
        emissiveIntensity={0.3}
        roughness={0.2}
        metalness={0.8}
        transparent
        opacity={0.7}
      />
    </Sphere>
  );
}
