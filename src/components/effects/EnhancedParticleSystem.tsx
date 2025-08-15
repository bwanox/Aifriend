'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppContext } from '@/contexts/AppContext';
import { themes } from '@/lib/themes';

export default function EnhancedParticleSystem() {
  const { state } = useAppContext();
  const pointsRef = useRef<THREE.Points>(null);
  const currentTheme = themes[state.currentTheme];
  const { viewport, camera } = useThree();

  // Use a fixed particle count to avoid buffer resizing
  const maxParticles = 300; // Increased for better coverage
  const activeParticleCount = Math.min(currentTheme.particles.count, maxParticles);

  const particleData = useMemo(() => {
    const positions = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);
    const sizes = new Float32Array(maxParticles);
    const velocities = new Float32Array(maxParticles * 3);

    // Calculate proper bounds based on camera and viewport
    const aspect = viewport.width / viewport.height;
    const fov = camera.fov * (Math.PI / 180);
    const cameraDistance = camera.position.length();

    // Calculate visible bounds at different depths
    const maxDepth = 30;
    const minDepth = 8;

    for (let i = 0; i < maxParticles; i++) {
      // Distribute particles across the entire visible volume
      const depth = minDepth + Math.random() * (maxDepth - minDepth);
      const visibleHeight = 2 * Math.tan(fov / 2) * depth;
      const visibleWidth = visibleHeight * aspect;

      // Expand beyond visible bounds for better coverage during camera movement
      const expansionFactor = 1.5;
      const maxX = (visibleWidth / 2) * expansionFactor;
      const maxY = (visibleHeight / 2) * expansionFactor;

      // Create full-screen distribution
      positions[i * 3] = (Math.random() - 0.5) * maxX * 2;     // X: left to right
      positions[i * 3 + 1] = (Math.random() - 0.5) * maxY * 2; // Y: top to bottom
      positions[i * 3 + 2] = -depth + (Math.random() - 0.5) * 10; // Z: depth variation

      // Random velocities for organic movement
      velocities[i * 3] = (Math.random() - 0.5) * 0.015;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.015;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;

      // Varied sizes based on depth (smaller when farther)
      const depthFactor = 1 - (depth - minDepth) / (maxDepth - minDepth);
      sizes[i] = (Math.random() * currentTheme.particles.size + 0.3) * (0.5 + depthFactor * 0.8);

      // Enhanced colors with variation
      const color = new THREE.Color(currentTheme.particles.color);
      const variation = 0.4;
      color.r += (Math.random() - 0.5) * variation;
      color.g += (Math.random() - 0.5) * variation;
      color.b += (Math.random() - 0.5) * variation;

      colors[i * 3] = Math.max(0, Math.min(1, color.r));
      colors[i * 3 + 1] = Math.max(0, Math.min(1, color.g));
      colors[i * 3 + 2] = Math.max(0, Math.min(1, color.b));
    }

    return { positions, colors, sizes, velocities };
  }, [currentTheme.particles.color, currentTheme.particles.size, viewport, camera]);

  useFrame((frameState) => {
    if (!pointsRef.current) return;

    const time = frameState.clock.elapsedTime;
    const positionAttribute = pointsRef.current.geometry.getAttribute('position');
    const sizeAttribute = pointsRef.current.geometry.getAttribute('size');

    if (positionAttribute && sizeAttribute) {
      const positions = positionAttribute.array as Float32Array;
      const sizes = sizeAttribute.array as Float32Array;

      // Recalculate visible bounds for boundary management
      const aspect = viewport.width / viewport.height;
      const fov = camera.fov * (Math.PI / 180);
      const avgDepth = 20;
      const visibleHeight = 2 * Math.tan(fov / 2) * avgDepth;
      const visibleWidth = visibleHeight * aspect;
      const maxX = visibleWidth;
      const maxY = visibleHeight;

      for (let i = 0; i < maxParticles; i++) {
        const i3 = i * 3;

        // Only animate active particles
        if (i < activeParticleCount) {
          // Organic floating motion with different frequencies per particle
          const frequency1 = 0.3 + (i % 20) * 0.05;
          const frequency2 = 0.2 + (i % 15) * 0.03;
          const frequency3 = 0.4 + (i % 12) * 0.04;

          positions[i3] += particleData.velocities[i3];
          positions[i3 + 1] += Math.sin(time * frequency1 + i * 0.1) * 0.01 + particleData.velocities[i3 + 1];
          positions[i3 + 2] += Math.cos(time * frequency2 + i * 0.15) * 0.008 + particleData.velocities[i3 + 2];

          // Gentle pulsing size
          sizes[i] = particleData.sizes[i] * (1 + Math.sin(time * frequency3 + i) * 0.3);

          // Boundary wrapping to maintain full-screen coverage
          if (positions[i3] > maxX) positions[i3] = -maxX;
          if (positions[i3] < -maxX) positions[i3] = maxX;
          if (positions[i3 + 1] > maxY) positions[i3 + 1] = -maxY;
          if (positions[i3 + 1] < -maxY) positions[i3 + 1] = maxY;

          // Keep depth within reasonable bounds
          if (positions[i3 + 2] > 5) positions[i3 + 2] = -25;
          if (positions[i3 + 2] < -30) positions[i3 + 2] = 5;
        } else {
          // Hide inactive particles
          sizes[i] = 0;
        }
      }

      positionAttribute.needsUpdate = true;
      sizeAttribute.needsUpdate = true;
    }

    // Subtle rotation of the entire system
    pointsRef.current.rotation.y = time * 0.003;
    pointsRef.current.rotation.x = Math.sin(time * 0.002) * 0.05;
  });

  if (!state.userPreferences.particleEffects) {
    return null;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={maxParticles}
          array={particleData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={maxParticles}
          array={particleData.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={maxParticles}
          array={particleData.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2.5} // Slightly larger base size
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        map={new THREE.CanvasTexture((() => {
          // Create a circular texture for perfectly round particles
          const canvas = document.createElement('canvas');
          const size = 64; // Higher resolution for better quality
          canvas.width = size;
          canvas.height = size;
          const context = canvas.getContext('2d');
          if (context) {
            const gradient = context.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.2, 'rgba(255,255,255,0.9)');
            gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
            gradient.addColorStop(0.8, 'rgba(255,255,255,0.2)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            context.fillStyle = gradient;
            context.fillRect(0, 0, size, size);
          }
          return canvas;
        })())}
      />
    </points>
  );
}
