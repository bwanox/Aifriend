'use client';

import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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
      camera={{ position: [0, 0.5, 3], fov: 50 }}
      style={{ touchAction: 'none' }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight
        position={[3, 3, 3]}
        intensity={3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Suspense fallback={null}>
        <ChatbotModel emotion={emotion} isSpeaking={isSpeaking} />
      </Suspense>
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 2}
        minDistance={2}
        maxDistance={5}
        target={[0, 0.5, 0]}
      />
      <gridHelper args={[10, 10]} position={[0, -0.5, 0]} />
    </Canvas>
  );
}
