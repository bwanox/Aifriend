'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import ChatbotModel from './ChatbotModel';
import { type Emotion } from '@/lib/types';

type ChatbotCanvasProps = {
  emotion: Emotion;
  isSpeaking: boolean;
};

export default function ChatbotCanvas({ emotion, isSpeaking }: ChatbotCanvasProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.5, 5], fov: 50 }}
      style={{ touchAction: 'none' }}
    >
      <fog attach="fog" args={['#100f1c', 5, 15]} />
      <color attach="background" args={['#100f1c']} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#9c33ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff33a1" />
      <directionalLight
        position={[0, 5, 5]}
        intensity={2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={20}
      />
      <Suspense fallback={null}>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ChatbotModel emotion={emotion} isSpeaking={isSpeaking} />
      </Suspense>
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        minDistance={3}
        maxDistance={8}
        target={[0, 0.5, 0]}
      />
    </Canvas>
  );
}
