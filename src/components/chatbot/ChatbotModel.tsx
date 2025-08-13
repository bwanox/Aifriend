'use client';

import * as THREE from 'three';
import React, { useRef, useMemo, useEffect } from 'react';
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
const NUM_RINGS = 4;

type ChatbotModelProps = {
  emotion: Emotion;
  isSpeaking: boolean;
};

export default function ChatbotModel({ emotion, isSpeaking }: ChatbotModelProps) {
  const group = useRef<THREE.Group>(null!);
  const core = useRef<THREE.Mesh>(null!);
  const particleRings = useRef<THREE.InstancedMesh[]>([]);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Store random values for each ring to make their movement unique
  const ringParams = useMemo(() => 
    [...Array(NUM_RINGS)].map(() => ({
      rotationSpeed: (Math.random() - 0.5) * 0.5,
      waveFrequency: 2 + Math.random() * 4,
      waveAmplitude: 0.1 + Math.random() * 0.2,
    })), []);

  // For saccade (quick glance) movement
  const saccade = useRef({
    targetRotation: new THREE.Quaternion(),
    isSaccading: false,
    timer: 0,
  });

  useEffect(() => {
    // Reset saccade timer on emotion change
    saccade.current.timer = Math.random() * 5;
  }, [emotion]);


  useFrame((state, delta) => {
    if (!group.current || !core.current) return;
    
    const t = state.clock.getElapsedTime();
    const config = emotionConfig[emotion] || emotionConfig.idle;

    // --- Core Animation ---
    // 1. Organic, Perlin-like floating motion
    const driftX = Math.sin(t * 0.2) * 0.05 + Math.sin(t * 0.7) * 0.02;
    const driftY = Math.cos(t * 0.3) * 0.1 + Math.sin(t * 0.5) * 0.05;
    const driftZ = Math.sin(t * 0.4) * 0.05;
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, driftX, 0.02);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, driftY + 0.5, 0.02);
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, driftZ, 0.02);

    // 2. Saccade (quick glance) logic
    saccade.current.timer -= delta;
    if (saccade.current.timer <= 0 && !saccade.current.isSaccading) {
      saccade.current.isSaccading = true;
      const euler = new THREE.Euler(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.5
      );
      saccade.current.targetRotation.setFromEuler(euler);
    }

    if (saccade.current.isSaccading) {
        group.current.quaternion.slerp(saccade.current.targetRotation, 0.1);
        if (group.current.quaternion.angleTo(saccade.current.targetRotation) < 0.01) {
            saccade.current.isSaccading = false;
            saccade.current.timer = 2 + Math.random() * 4; // next saccade in 2-6 seconds
        }
    } else {
        // Gently drift back to neutral rotation
        group.current.quaternion.slerp(new THREE.Quaternion(), 0.02);
    }

    // 3. Update core emissive & breathing based on state
    const targetIntensity = isSpeaking ? config.intensity * 1.5 : config.intensity;
    coreMaterial.emissiveIntensity = THREE.MathUtils.lerp(coreMaterial.emissiveIntensity, targetIntensity, 0.1);
    
    const breathingSpeed = isSpeaking ? config.speed * 1.8 : config.speed;
    const breathingScale = isSpeaking ? 1 + Math.sin(t * breathingSpeed) * config.scale * 1.5 : 1;
    const targetScale = isSpeaking ? 1.05 : 1; // Unfurl effect when speaking
    core.current.scale.setScalar(THREE.MathUtils.lerp(core.current.scale.x, breathingScale * targetScale, 0.1));

    // --- Particle Ring Animation ---
    particleRings.current.forEach((instancedMesh, ringIndex) => {
      if (!instancedMesh) return;

      const baseSpeed = isSpeaking ? config.particleSpeed * 2 : config.particleSpeed;
      const baseRadius = isSpeaking ? config.ringRadius * 1.2 : config.ringRadius;
      
      const params = ringParams[ringIndex];
      const speedFactor = baseSpeed * (1 + ringIndex * 0.2);
      const radius = baseRadius * (0.8 + ringIndex * 0.2);
      
      instancedMesh.rotation.y += delta * speedFactor * params.rotationSpeed;
      instancedMesh.rotation.x += delta * speedFactor * params.rotationSpeed * 0.2;

      for (let i = 0; i < NUM_PARTICLES_PER_RING; i++) {
        const angle = (i / NUM_PARTICLES_PER_RING) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const waveSpeed = t * speedFactor;
        const wave1 = Math.sin(angle * params.waveFrequency + waveSpeed) * params.waveAmplitude;
        const wave2 = Math.cos(angle * (params.waveFrequency * 0.5) + waveSpeed * 0.5) * (params.waveAmplitude * 0.5);
        const y = wave1 + wave2;
        
        dummy.position.set(x, y, z);
        
        const speakingPulse = isSpeaking ? 1.0 + Math.sin(t * 10 + i * 0.5) * 0.5 : 1.0;
        const particleScale = (0.5 + Math.sin(angle * 7 + waveSpeed) * 0.5) * speakingPulse;
        dummy.scale.setScalar(particleScale * 0.8);

        dummy.lookAt(core.current.position);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }
      instancedMesh.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <group ref={group} dispose={null} castShadow receiveShadow>
      <mesh ref={core} material={coreMaterial} castShadow>
        <icosahedronGeometry args={[0.5, 3]} />
      </mesh>
      
      {[...Array(NUM_RINGS)].map((_, i) => (
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
