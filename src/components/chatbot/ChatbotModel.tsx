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
  idle: { speed: 0.5, intensity: 2, particleSpeed: 0.2, ringRadius: 1, scale: 0.05 },
  happy: { speed: 2, intensity: 5, particleSpeed: 1, ringRadius: 1.1, scale: 0.1 },
  sad: { speed: 0.2, intensity: 0.5, particleSpeed: 0.05, ringRadius: 0.9, scale: 0.02 },
  thinking: { speed: 1, intensity: 3, particleSpeed: 0.5, ringRadius: 1.05, scale: 0.07 },
  surprised: { speed: 3, intensity: 8, particleSpeed: 2, ringRadius: 1.2, scale: 0.12 },
};

const NUM_PARTICLES_PER_RING = 60;

type ChatbotModelProps = {
  emotion: Emotion;
  isSpeaking: boolean;
};

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
    const bobbleY = Math.sin(t * 1.5) * 0.1;
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, bobbleY, 0.05);

    // Update core emissive intensity based on emotion and speaking state
    const targetIntensity = isSpeaking ? config.intensity * 2 : config.intensity;
    coreMaterial.emissiveIntensity = THREE.MathUtils.lerp(coreMaterial.emissiveIntensity, targetIntensity, 0.1);
    
    // Animate core scale for a breathing effect
    const breathingSpeed = isSpeaking ? config.speed * 2 : config.speed;
    const breathingScale = isSpeaking ? config.scale * 1.5 : config.scale;
    const coreScale = 1 + Math.sin(t * breathingSpeed) * breathingScale;
    core.current.scale.setScalar(THREE.MathUtils.lerp(core.current.scale.x, coreScale, 0.1));

    // Animate particle rings
    particleRings.current.forEach((instancedMesh, ringIndex) => {
      if (!instancedMesh) return;

      const baseSpeed = isSpeaking ? config.particleSpeed * 2.5 : config.particleSpeed;
      const baseRadius = isSpeaking ? config.ringRadius * 1.1 : config.ringRadius;

      const speedFactor = baseSpeed * (1 + ringIndex * 0.1);
      const radius = baseRadius * (0.8 + ringIndex * 0.15);
      
      instancedMesh.rotation.y += delta * speedFactor * 0.2 * (ringIndex % 2 === 0 ? 1 : -1);

      for (let i = 0; i < NUM_PARTICLES_PER_RING; i++) {
        const angle = (i / NUM_PARTICLES_PER_RING) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const waveSpeed = t * speedFactor;
        const wave1 = Math.sin(angle * 3 + waveSpeed) * 0.2;
        const wave2 = Math.cos(angle * 5 + waveSpeed * 0.5) * 0.1;
        const y = wave1 + wave2;
        
        dummy.position.set(x, y, z);

        const particleScale = 0.5 + Math.sin(angle * 7 + waveSpeed) * 0.5;
        dummy.scale.setScalar(particleScale * (isSpeaking ? 1.5 : 1));

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
        <icosahedronGeometry args={[0.5, 3]} />
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
