'use client';

import * as THREE from 'three';
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import { type Emotion } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';
import { themes } from '@/lib/themes';

const emotionConfig = {
  idle: {
    speed: 0.8, intensity: 2, particleSpeed: 0.3, ringRadius: 1, scale: 0.06, coreGlow: 0.4,
    pulseIntensity: 0.1, breathingSpeed: 1.2, energyLevel: 0.3, distortion: 0.1
  },
  happy: {
    speed: 2.5, intensity: 6, particleSpeed: 1.2, ringRadius: 1.15, scale: 0.12, coreGlow: 0.8,
    pulseIntensity: 0.4, breathingSpeed: 2.0, energyLevel: 0.8, distortion: 0.3
  },
  sad: {
    speed: 0.3, intensity: 0.8, particleSpeed: 0.1, ringRadius: 0.85, scale: 0.03, coreGlow: 0.2,
    pulseIntensity: 0.05, breathingSpeed: 0.5, energyLevel: 0.1, distortion: 0.05
  },
  thinking: {
    speed: 1.2, intensity: 4, particleSpeed: 0.6, ringRadius: 1.08, scale: 0.08, coreGlow: 0.6,
    pulseIntensity: 0.3, breathingSpeed: 1.8, energyLevel: 0.6, distortion: 0.2
  },
  surprised: {
    speed: 3.5, intensity: 8, particleSpeed: 2.2, ringRadius: 1.3, scale: 0.15, coreGlow: 1.0,
    pulseIntensity: 0.6, breathingSpeed: 3.0, energyLevel: 1.0, distortion: 0.4
  },
  excited: {
    speed: 4.0, intensity: 10, particleSpeed: 2.8, ringRadius: 1.4, scale: 0.18, coreGlow: 1.2,
    pulseIntensity: 0.8, breathingSpeed: 3.5, energyLevel: 1.2, distortion: 0.5
  },
};

const NUM_PARTICLES_PER_RING = 32; // More particles for richer visual
const NUM_RINGS = 5; // More rings for complexity
const NUM_ENERGY_STREAMS = 8; // New energy stream effect

type ChatbotModelProps = {
  emotion: Emotion;
  isSpeaking: boolean;
};

export default function ChatbotModel({ emotion, isSpeaking }: ChatbotModelProps) {
  const { state } = useAppContext();
  const currentTheme = themes[state.currentTheme];

  const group = useRef<THREE.Group>(null!);
  const core = useRef<THREE.Mesh>(null!);
  const innerCore = useRef<THREE.Mesh>(null!);
  const energyCore = useRef<THREE.Mesh>(null!);
  const outerRings = useRef<THREE.Mesh[]>([]);
  const particleRings = useRef<THREE.InstancedMesh[]>([]);
  const energyStreams = useRef<THREE.InstancedMesh[]>([]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Enhanced ring parameters with more variety
  const ringParams = useMemo(() =>
    [...Array(NUM_RINGS)].map((_, index) => ({
      radius: 0.7 + index * 0.28, // Tighter spacing
      height: Math.sin((index / NUM_RINGS) * Math.PI * 4) * 0.12, // More wave variation
      rotationSpeed: 0.15 + index * 0.08,
      particleRotationSpeed: 0.4 + index * 0.15,
      tilt: (index * Math.PI) / 8 + Math.sin(index) * 0.2, // More complex tilts
      phase: (index * Math.PI) / 3,
      opacity: 1 - (index * 0.15), // Fade outer rings
      size: 1 - (index * 0.1), // Smaller particles on outer rings
    })), []
  );

  // Energy stream parameters for dynamic effects
  const energyParams = useMemo(() =>
    [...Array(NUM_ENERGY_STREAMS)].map((_, index) => ({
      radius: 0.5 + Math.random() * 1.5,
      speed: 0.5 + Math.random() * 2,
      phase: (index / NUM_ENERGY_STREAMS) * Math.PI * 2,
      frequency: 1 + Math.random() * 3,
      amplitude: 0.1 + Math.random() * 0.2,
    })), []
  );

  // Ultra high-quality geometry
  const particleGeometry = useMemo(() => new THREE.SphereGeometry(0.015, 24, 24), []);
  const energyGeometry = useMemo(() => new THREE.CylinderGeometry(0.002, 0.006, 0.1, 8), []);

  // Enhanced materials with more visual appeal
  const coreMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: currentTheme.colors.primary,
    roughness: 0.01,
    metalness: 0.9,
    emissive: currentTheme.colors.primary,
    emissiveIntensity: 0.3,
    envMapIntensity: 3,
    transmission: 0.1,
    thickness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  }), [currentTheme]);

  const ringParticleMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: currentTheme.colors.secondary,
    roughness: 0.02,
    metalness: 0.95,
    emissive: currentTheme.colors.accent,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.9,
    clearcoat: 0.8,
  }), [currentTheme]);

  const energyMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: currentTheme.colors.accent,
    transparent: true,
    opacity: 0.6,
  }), [currentTheme]);

  const ringMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: currentTheme.colors.accent,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
  }), [currentTheme]);

  useEffect(() => {
    // Clean up existing elements
    [...particleRings.current, ...energyStreams.current, ...outerRings.current].forEach(mesh => {
      if (group.current && group.current.children.includes(mesh)) {
        group.current.remove(mesh);
      }
      if (mesh.geometry) mesh.geometry.dispose();
    });

    particleRings.current = [];
    energyStreams.current = [];
    outerRings.current = [];

    // Create enhanced orbital rings
    for (let i = 0; i < NUM_RINGS; i++) {
      const params = ringParams[i];
      const ringGeometry = new THREE.TorusGeometry(params.radius, 0.001, 8, 64);
      const ring = new THREE.Mesh(ringGeometry, ringMaterial.clone());
      ring.material.opacity = params.opacity * 0.1;
      ring.rotation.x = params.tilt;
      ring.position.y = params.height;

      if (group.current) {
        group.current.add(ring);
      }
      outerRings.current.push(ring);
    }

    // Create particle rings with enhanced variety
    for (let ringIndex = 0; ringIndex < NUM_RINGS; ringIndex++) {
      const instancedMesh = new THREE.InstancedMesh(
        particleGeometry,
        ringParticleMaterial.clone(),
        NUM_PARTICLES_PER_RING
      );

      // Enhanced material properties per ring
      instancedMesh.material.opacity = ringParams[ringIndex].opacity;

      for (let i = 0; i < NUM_PARTICLES_PER_RING; i++) {
        const angle = (i / NUM_PARTICLES_PER_RING) * Math.PI * 2;
        const params = ringParams[ringIndex];

        dummy.position.set(
          Math.cos(angle) * params.radius,
          params.height,
          Math.sin(angle) * params.radius
        );
        dummy.scale.setScalar(params.size);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      instancedMesh.castShadow = true;
      instancedMesh.receiveShadow = true;

      if (group.current) {
        group.current.add(instancedMesh);
      }
      particleRings.current.push(instancedMesh);
    }

    // Create energy streams for dynamic life
    for (let streamIndex = 0; streamIndex < NUM_ENERGY_STREAMS; streamIndex++) {
      const instancedMesh = new THREE.InstancedMesh(
        energyGeometry,
        energyMaterial.clone(),
        16 // Multiple segments per stream
      );

      instancedMesh.material.opacity = 0.3 + Math.random() * 0.3;

      for (let i = 0; i < 16; i++) {
        dummy.position.set(0, 0, 0);
        dummy.scale.setScalar(0.1);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;

      if (group.current) {
        group.current.add(instancedMesh);
      }
      energyStreams.current.push(instancedMesh);
    }

    return () => {
      // Cleanup
      [...particleRings.current, ...energyStreams.current, ...outerRings.current].forEach(mesh => {
        if (group.current && group.current.children.includes(mesh)) {
          group.current.remove(mesh);
        }
      });
    };
  }, [ringParticleMaterial, particleGeometry, energyGeometry, energyMaterial, ringMaterial, ringParams, energyParams]);

  useFrame((frameState) => {
    if (!group.current || !core.current || !innerCore.current || !energyCore.current) return;

    const time = frameState.clock.elapsedTime;
    const config = emotionConfig[emotion] || emotionConfig.idle;

    // Enhanced core animations with more life
    const breathingScale = 0.35 + Math.sin(time * config.breathingSpeed) * config.scale * 2;
    const pulseIntensity = config.pulseIntensity * (1 + Math.sin(time * 8) * 0.3);

    core.current.scale.setScalar(breathingScale + pulseIntensity);

    // Inner core with complex motion
    const innerBreathing = 0.22 + Math.sin(time * config.breathingSpeed * 1.3) * config.scale * 1.5;
    innerCore.current.scale.setScalar(innerBreathing + pulseIntensity * 0.8);
    innerCore.current.rotation.y = -time * 0.4;
    innerCore.current.rotation.x = Math.sin(time * 0.3) * 0.1;

    // Energy core with rapid fluctuations
    const energyScale = 0.15 + Math.sin(time * 6) * 0.05 + config.energyLevel * 0.1;
    energyCore.current.scale.setScalar(energyScale);
    energyCore.current.rotation.z = time * 2;

    // Enhanced core material effects
    if (core.current.material instanceof THREE.MeshPhysicalMaterial) {
      const baseIntensity = config.coreGlow;
      core.current.material.emissiveIntensity = isSpeaking
        ? baseIntensity * (1.5 + Math.sin(time * 20) * 0.5)
        : baseIntensity * (1 + Math.sin(time * 3) * 0.2);

      // Dynamic transmission for glass-like effect
      core.current.material.transmission = 0.1 + config.energyLevel * 0.2;
    }

    // Animate particle rings with more complex motion
    particleRings.current.forEach((ring, ringIndex) => {
      if (!ring) return;

      const params = ringParams[ringIndex];

      for (let i = 0; i < NUM_PARTICLES_PER_RING; i++) {
        const baseAngle = (i / NUM_PARTICLES_PER_RING) * Math.PI * 2;
        const orbitAngle = baseAngle + time * config.particleSpeed * params.particleRotationSpeed;

        // Complex vertical motion
        const waveHeight = Math.sin(time * 2.5 + params.phase + i * 0.3) * 0.08 * config.energyLevel;
        const spiralMotion = Math.sin(orbitAngle * 2) * 0.02 * config.pulseIntensity;

        const currentRadius = params.radius * config.ringRadius;

        dummy.position.set(
          Math.cos(orbitAngle) * (currentRadius + spiralMotion),
          params.height + waveHeight,
          Math.sin(orbitAngle) * (currentRadius + spiralMotion)
        );

        // Dynamic particle scaling with emotion and speaking
        let particleScale = params.size * (0.8 + Math.sin(time * 4 + i * 0.4) * 0.3);

        if (emotion === 'happy') particleScale *= 1.4;
        else if (emotion === 'surprised') particleScale *= 1.6;
        else if (emotion === 'sad') particleScale *= 0.5;
        else if (emotion === 'thinking') {
          const sequenceOffset = (i / NUM_PARTICLES_PER_RING) * Math.PI * 2;
          particleScale *= 1 + Math.sin(time * 6 + sequenceOffset) * 0.5;
        }

        if (isSpeaking) {
          particleScale *= 1 + Math.sin(time * 15 + i) * 0.2;
        }

        dummy.scale.setScalar(particleScale);
        dummy.updateMatrix();
        ring.setMatrixAt(i, dummy.matrix);
      }
      ring.instanceMatrix.needsUpdate = true;

      // Dynamic material effects
      if (ring.material instanceof THREE.MeshPhysicalMaterial) {
        ring.material.emissiveIntensity = 0.8 + Math.sin(time * 2 + ringIndex) * 0.3 + config.energyLevel * 0.4;

        if (isSpeaking) {
          ring.material.emissiveIntensity += 0.5;
        }
      }
    });

    // Animate energy streams for life-like movement
    energyStreams.current.forEach((stream, streamIndex) => {
      if (!stream) return;

      const params = energyParams[streamIndex];

      for (let i = 0; i < 16; i++) {
        const t = i / 16;
        const angle = params.phase + time * params.speed;
        const radius = params.radius * (0.3 + t * 0.7);
        const height = Math.sin(time * params.frequency + t * 10) * params.amplitude;

        dummy.position.set(
          Math.cos(angle + t * 2) * radius,
          height + (t - 0.5) * 0.5,
          Math.sin(angle + t * 2) * radius
        );

        dummy.scale.setScalar(0.1 + config.energyLevel * 0.2 * (1 - t));
        dummy.lookAt(core.current.position);
        dummy.updateMatrix();
        stream.setMatrixAt(i, dummy.matrix);
      }
      stream.instanceMatrix.needsUpdate = true;

      // Dynamic stream opacity
      if (stream.material instanceof THREE.MeshBasicMaterial) {
        stream.material.opacity = 0.2 + config.energyLevel * 0.4 + Math.sin(time * 3 + streamIndex) * 0.2;
      }
    });

    // Update orbital guide rings with life
    outerRings.current.forEach((ring, index) => {
      if (ring.material instanceof THREE.MeshBasicMaterial) {
        ring.material.opacity = 0.05 + Math.sin(time * 0.8 + index) * 0.03 + config.energyLevel * 0.02;
      }
      ring.rotation.z = time * 0.08 * (index + 1);
    });

    // Enhanced group rotation with personality
    const rotationSpeed = 0.12 + config.energyLevel * 0.08;
    group.current.rotation.y = time * rotationSpeed;

    // Emotion-specific movements with more personality
    if (emotion === 'thinking') {
      group.current.rotation.x = Math.sin(time * 0.8) * 0.12;
      group.current.rotation.z = Math.cos(time * 0.6) * 0.08;
      group.current.position.y = 0.5 + Math.sin(time * 1.5) * 0.03;
    } else if (emotion === 'happy') {
      group.current.rotation.y = time * 0.28;
      group.current.position.y = 0.5 + Math.sin(time * 3) * 0.06;
      group.current.position.x = Math.sin(time * 1.2) * 0.02;
    } else if (emotion === 'surprised') {
      group.current.rotation.y = time * 0.35;
      group.current.position.y = 0.5 + Math.sin(time * 5) * 0.1;
      group.current.position.x = Math.sin(time * 2) * 0.04;
      group.current.position.z = Math.cos(time * 1.8) * 0.03;
    } else if (emotion === 'sad') {
      group.current.rotation.y = time * 0.08;
      group.current.position.y = 0.5 + Math.sin(time * 0.8) * 0.02;
      group.current.rotation.x = -0.05;
    }
  });

  return (
    <Float
      speed={emotionConfig[emotion]?.breathingSpeed || 1}
      rotationIntensity={emotionConfig[emotion]?.pulseIntensity || 0.1}
      floatIntensity={emotionConfig[emotion]?.energyLevel * 0.3 || 0.1}
    >
      <group ref={group} position={[0, 0.5, 0]}>
        {/* Ultra high-quality core with glass-like properties */}
        <Sphere ref={core} args={[0.35, 128, 128]} castShadow receiveShadow>
          <meshPhysicalMaterial
            {...coreMaterial}
            color={currentTheme.colors.primary}
            emissive={currentTheme.colors.primary}
          />
        </Sphere>

        {/* Inner rotating core with distortion for life */}
        <Sphere ref={innerCore} args={[0.22, 64, 64]} castShadow>
          <MeshDistortMaterial
            color={currentTheme.colors.secondary}
            roughness={0.1}
            metalness={0.8}
            emissive={currentTheme.colors.secondary}
            emissiveIntensity={0.4}
            transparent
            opacity={0.8}
            distort={emotionConfig[emotion]?.distortion || 0.1}
            speed={2}
          />
        </Sphere>

        {/* Energy core for rapid fluctuations */}
        <Sphere ref={energyCore} args={[0.15, 32, 32]}>
          <meshBasicMaterial
            color={currentTheme.colors.accent}
            transparent
            opacity={0.6}
          />
        </Sphere>

        {/* Enhanced multi-layered aura system */}
        <Sphere args={[0.45, 32, 32]}>
          <meshBasicMaterial
            color={currentTheme.colors.secondary}
            transparent
            opacity={0.15}
          />
        </Sphere>

        <Sphere args={[0.6, 32, 32]}>
          <meshBasicMaterial
            color={currentTheme.colors.accent}
            transparent
            opacity={0.1}
          />
        </Sphere>

        <Sphere args={[0.8, 32, 32]}>
          <meshBasicMaterial
            color={currentTheme.colors.primary}
            transparent
            opacity={0.06}
          />
        </Sphere>

        <Sphere args={[1.0, 32, 32]}>
          <meshBasicMaterial
            color={currentTheme.colors.secondary}
            transparent
            opacity={0.03}
          />
        </Sphere>
      </group>
    </Float>
  );
}
