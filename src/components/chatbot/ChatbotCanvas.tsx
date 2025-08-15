'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import ChatbotModel from './ChatbotModel';
import EnhancedParticleSystem from '@/components/effects/EnhancedParticleSystem';
import { type Emotion } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';
import { themes } from '@/lib/themes';

type ChatbotCanvasProps = {
  emotion: Emotion;
  isSpeaking: boolean;
};

export default function ChatbotCanvas({ emotion, isSpeaking }: ChatbotCanvasProps) {
  const { state } = useAppContext();
  const currentTheme = themes[state.currentTheme];

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Dynamic background gradient overlay that responds to emotions */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none transition-all duration-1000"
        style={{
          background: `
            radial-gradient(ellipse at 50% 30%, ${currentTheme.colors.primary}25 0%, transparent 50%),
            radial-gradient(ellipse at 20% 80%, ${currentTheme.colors.secondary}20 0%, transparent 40%),
            radial-gradient(ellipse at 80% 70%, ${currentTheme.colors.accent}15 0%, transparent 35%),
            linear-gradient(135deg, ${currentTheme.background.primary} 0%, ${currentTheme.background.secondary} 100%)
          `,
        }}
      />

      {/* Animated energy waves based on emotion */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {emotion === 'happy' && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${currentTheme.colors.primary}30 0%, transparent 60%)`,
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
        )}
        {emotion === 'excited' && (
          <div
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from 0deg, ${currentTheme.colors.primary}20, ${currentTheme.colors.secondary}20, ${currentTheme.colors.accent}20, ${currentTheme.colors.primary}20)`,
              animation: 'spin 8s linear infinite'
            }}
          />
        )}
        {emotion === 'thinking' && (
          <div
            className="absolute inset-0"
            style={{
              background: `repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${currentTheme.colors.accent}10 15deg, transparent 30deg)`,
              animation: 'spin 20s linear infinite reverse'
            }}
          />
        )}
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 0.5, 5], fov: 50 }}
        style={{ touchAction: 'none' }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        dpr={[1, 2]}
      >
        {/* Enhanced HDR environment for realistic reflections */}
        <Environment preset="night" />

        {/* Dynamic background based on theme */}
        <color attach="background" args={[currentTheme.background.primary]} />

        {/* Enhanced fog with theme colors and emotion responsiveness */}
        <fog
          attach="fog"
          args={[
            currentTheme.background.secondary,
            emotion === 'happy' ? 8 : emotion === 'sad' ? 3 : 5,
            emotion === 'excited' ? 20 : emotion === 'sad' ? 12 : 15
          ]}
        />

        {/* Advanced lighting system with emotional responses */}
        <ambientLight
          intensity={0.3 + (emotion === 'happy' ? 0.2 : emotion === 'sad' ? -0.1 : 0)}
          color={currentTheme.lighting.ambient}
        />

        {/* Primary mood light */}
        <pointLight
          position={[10, 10, 10]}
          intensity={1.5 + (isSpeaking ? 0.5 : 0)}
          color={currentTheme.lighting.point1}
          decay={2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        {/* Secondary accent light */}
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.8 + (emotion === 'thinking' ? 0.4 : 0)}
          color={currentTheme.lighting.point2}
          decay={2}
        />

        {/* Enhanced directional light with emotion-based intensity */}
        <directionalLight
          position={[0, 5, 5]}
          intensity={1.2 + (emotion === 'excited' ? 0.8 : emotion === 'sad' ? -0.3 : 0)}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-far={20}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          color={currentTheme.colors.accent}
        />

        {/* Dynamic spotlights based on bot emotion */}
        {emotion === 'happy' && (
          <spotLight
            position={[0, 8, 2]}
            intensity={0.8}
            color={currentTheme.colors.primary}
            angle={0.4}
            penumbra={0.6}
            castShadow
            decay={2}
          />
        )}

        {emotion === 'surprised' && (
          <>
            <spotLight
              position={[5, 5, 5]}
              intensity={0.6}
              color={currentTheme.colors.secondary}
              angle={0.3}
              penumbra={0.8}
              decay={1.5}
            />
            <spotLight
              position={[-5, 5, 5]}
              intensity={0.6}
              color={currentTheme.colors.accent}
              angle={0.3}
              penumbra={0.8}
              decay={1.5}
            />
          </>
        )}

        {emotion === 'thinking' && (
          <pointLight
            position={[0, 3, 0]}
            intensity={0.5}
            color={currentTheme.colors.accent}
            decay={3}
          />
        )}

        <Suspense fallback={null}>
          {/* Enhanced particle system */}
          <EnhancedParticleSystem />

          {/* Dynamic stars that respond to theme and emotion */}
          <Stars
            radius={120}
            depth={80}
            count={state.userPreferences.particleEffects ?
              (emotion === 'surprised' ? 4000 : emotion === 'happy' ? 3500 : 2500) : 1500
            }
            factor={emotion === 'surprised' ? 6 : emotion === 'happy' ? 5 : 4}
            saturation={emotion === 'sad' ? 0.3 : 0.8}
            fade={emotion === 'thinking'}
            speed={emotion === 'surprised' ? 1.2 : emotion === 'happy' ? 0.8 : 0.3}
          />

          {/* Main chatbot model */}
          <ChatbotModel emotion={emotion} isSpeaking={isSpeaking} />
        </Suspense>

        {/* Enhanced orbit controls with emotion-responsive settings */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={state.userPreferences.animations}
          autoRotateSpeed={emotion === 'surprised' ? 1.5 : emotion === 'happy' ? 1.0 : 0.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
          minDistance={2.5}
          maxDistance={emotion === 'surprised' ? 10 : 8}
          target={[0, 0.5, 0]}
          enableDamping={true}
          dampingFactor={emotion === 'surprised' ? 0.03 : 0.05}
          rotateSpeed={emotion === 'thinking' ? 0.3 : 0.5}
          zoomSpeed={emotion === 'happy' ? 1.2 : 1.0}
        />
      </Canvas>

      {/* Floating UI enhancements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner accent effects */}
        <div
          className="absolute top-0 left-0 w-32 h-32 opacity-20 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${currentTheme.colors.primary}, transparent 70%)`,
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-40 h-40 opacity-15 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${currentTheme.colors.secondary}, transparent 70%)`,
          }}
        />

        {/* Dynamic emotion indicators */}
        {emotion === 'thinking' && (
          <div className="absolute top-1/2 left-8 transform -translate-y-1/2">
            <div className="flex flex-col gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-8 rounded-full opacity-40"
                  style={{
                    backgroundColor: currentTheme.colors.accent,
                    animation: `pulse 1.5s ease-in-out infinite ${i * 0.3}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
