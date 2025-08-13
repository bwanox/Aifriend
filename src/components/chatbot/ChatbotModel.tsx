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

const ringParticleMaterial = new THREE.MeshStandardMaterial({
  color: '#9c33ff',
  roughness: 0.2,
  metalness: 0.5,
  emissive: '#9c33ff',
  emissiveIntensity: 1,
});

const emotionConfig = {
  idle: { speed: 0.5, intensity: 2, particleSpeed: 0.2, ringRadius: 1 },
  happy: { speed: 2, intensity: 5, particleSpeed: 1, ringRadius: 1.1 },
  sad: { speed: 0.2, intensity: 0.5, particleSpeed: 0.05, ringRadius: 0.9 },
  thinking: { speed: 1, intensity: 3, particleSpeed: 0.5, ringRadius: 1.05 },
  surprised: { speed: 3, intensity: 8, particleSpeed: 2, ringRadius: 1.2 },
};

const NUM_PARTICLES_PER_RING = 60;

export default function ChatbotModel({ emotion, isSpeaking }: ChatbotModelProps) {
  const group = useRef<THREE.Group>(null!);
  const core = useRef<THREE.Mesh>(null!);
  const particleRings = useRef<THREE.InstancedMesh[]>([]);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!group.current || !core.current) return;
    
    const t = state.clock.getElapsedTime();
    const config = emotionConfig[emotion] || emotionConfig.idle;

    // Smooth bobbing animation
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, Math.sin(t * 1.5) * 0.1, 0.05);

    // Update core emissive intensity based on emotion and speaking state
    const targetIntensity = isSpeaking ? config.intensity * 1.5 : config.intensity;
    coreMaterial.emissiveIntensity = THREE.MathUtils.lerp(coreMaterial.emissiveIntensity, targetIntensity, 0.1);
    
    // Animate core scale for a breathing effect
    const coreScale = 1 + Math.sin(t * config.speed * 0.5) * 0.05;
    core.current.scale.setScalar(THREE.MathUtils.lerp(core.current.scale.x, coreScale, 0.1));


    // Animate particle rings
    particleRings.current.forEach((instancedMesh, ringIndex) => {
      if (!instancedMesh) return;

      const speedFactor = isSpeaking ? config.particleSpeed * 2 : config.particleSpeed;
      const radius = config.ringRadius * (0.8 + ringIndex * 0.15);

      for (let i = 0; i < NUM_PARTICLES_PER_RING; i++) {
        const angle = (i / NUM_PARTICLES_PER_RING) * Math.PI * 2 + t * speedFactor * (ringIndex % 2 === 0 ? 1 : -1);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(angle * (ringIndex + 2) * 1.5) * 0.15;
        
        dummy.position.set(x, y, z);
        dummy.lookAt(core.current.position);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }
      instancedMesh.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <group ref={group} dispose={null} position={[0, 0.5, 0]} castShadow receiveShadow>
      <mesh ref={core} material={coreMaterial} castShadow>
        <icosahedronGeometry args={[0.5, 1]} />
      </mesh>
      
      {[...Array(4)].map((_, i) => (
        <instancedMesh 
            key={i}
            ref={el => { if (el) particleRings.current[i] = el; }}
            args={[undefined, undefined, NUM_PARTICLES_PER_RING]} 
            material={ringParticleMaterial}
        >
            <sphereGeometry args={[0.02, 8, 8]} />
        </instancedMesh>
      ))}

    </group>
  );
}

type ChatbotModelProps = {
  emotion: Emotion;
  isSpeaking: boolean;
};
