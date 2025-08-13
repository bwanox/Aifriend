'use client';

import * as THREE from 'three';
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { type Emotion } from '@/lib/types';

type ChatbotModelProps = {
  emotion: Emotion;
  isSpeaking: boolean;
};

const eyeMaterial = new THREE.MeshStandardMaterial({ color: 'black', roughness: 0 });
const whiteMaterial = new THREE.MeshStandardMaterial({ color: 'white', roughness: 0.1 });
const bodyMaterial = new THREE.MeshStandardMaterial({ color: '#64B5F6', roughness: 0.3, metalness: 0.2 });

const emotionConfig = {
    idle: { headTilt: 0, eyeScale: 1 },
    happy: { headTilt: -0.1, eyeScale: 1.1 },
    sad: { headTilt: 0.2, eyeScale: 0.9 },
    thinking: { headTilt: 0.1, eyeScale: 1 },
    surprised: { headTilt: 0, eyeScale: 1.2 },
};

export default function ChatbotModel({ emotion, isSpeaking }: ChatbotModelProps) {
  const group = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const leftEye = useRef<THREE.Mesh>(null!);
  const rightEye = useRef<THREE.Mesh>(null!);
  const mouth = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  
  useFrame((state, delta) => {
    if (!group.current || !head.current) return;
    
    // Smoothly update head position for bobbing
    const t = state.clock.getElapsedTime();
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, Math.sin(t * 2) * 0.05 - 0.2, 0.05);

    // Eye tracking
    target.set(state.mouse.x * viewport.width / 2, state.mouse.y * viewport.height / 2, 2);
    head.current.lookAt(target);

    // Emotional expressions
    const config = emotionConfig[emotion] || emotionConfig.idle;
    
    // Head tilt
    head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, config.headTilt, 0.1);

    // Eye scale
    if(leftEye.current && rightEye.current) {
        const eyeScale = THREE.MathUtils.lerp(leftEye.current.scale.y, config.eyeScale, 0.1);
        leftEye.current.scale.set(1, eyeScale, 1);
        rightEye.current.scale.set(1, eyeScale, 1);
    }
    
    // Blinking
    if (t % 5 < 0.05) { // Blink every 5 seconds
        if(leftEye.current) leftEye.current.scale.y = 0.1;
        if(rightEye.current) rightEye.current.scale.y = 0.1;
    } else {
        if(leftEye.current) leftEye.current.scale.y = THREE.MathUtils.lerp(leftEye.current.scale.y, config.eyeScale, 0.2);
        if(rightEye.current) rightEye.current.scale.y = THREE.MathUtils.lerp(rightEye.current.scale.y, config.eyeScale, 0.2);
    }

    // Talking animation
    if(mouth.current){
        const targetMouthScaleY = isSpeaking ? 0.3 + Math.sin(t * 30) * 0.2 : 0.1;
        mouth.current.scale.y = THREE.MathUtils.lerp(mouth.current.scale.y, targetMouthScaleY, 0.5);
    }
  });

  return (
    <group ref={group} dispose={null} castShadow receiveShadow>
      <mesh material={bodyMaterial} castShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 1, 0.5]} />
      </mesh>
      <group ref={head} position={[0, 0.75, 0]}>
        <mesh material={bodyMaterial} castShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
        </mesh>
        <mesh ref={leftEye} material={whiteMaterial} position={[-0.15, 0.1, 0.45]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <mesh material={eyeMaterial} position={[0, 0, 0.06]}>
                <sphereGeometry args={[0.05, 16, 16]} />
            </mesh>
        </mesh>
        <mesh ref={rightEye} material={whiteMaterial} position={[0.15, 0.1, 0.45]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <mesh material={eyeMaterial} position={[0, 0, 0.06]}>
                <sphereGeometry args={[0.05, 16, 16]} />
            </mesh>
        </mesh>
        <mesh ref={mouth} material={eyeMaterial} position={[0, -0.2, 0.45]}>
            <boxGeometry args={[0.2, 0.05, 0.02]} />
        </mesh>
      </group>
    </group>
  );
}
