'use client';

import React, { useState } from 'react';
import { Settings, Palette, User, MessageSquare, Volume2, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import { themes, personalities, conversationModes } from '@/lib/themes';

export default function SettingsPanel() {
  const { state, dispatch } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = themes[state.currentTheme];
  const currentPersonality = personalities[state.botPersonality];
  const currentMode = conversationModes[state.conversationMode];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 right-4 z-50 bg-black/20 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-black/90 backdrop-blur-xl border-white/20 text-white overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            AI Friend Settings
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Theme Selection */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Palette className="h-4 w-4" />
                Visual Theme
              </CardTitle>
              <CardDescription className="text-gray-300">
                Choose your preferred visual atmosphere
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(themes).map(([key, theme]) => (
                  <Button
                    key={key}
                    variant={state.currentTheme === key ? "default" : "outline"}
                    className="h-auto p-3 flex flex-col gap-2 text-left"
                    style={{
                      backgroundColor: state.currentTheme === key ? theme.colors.primary : 'transparent',
                      borderColor: theme.colors.primary,
                    }}
                    onClick={() => dispatch({ type: 'CHANGE_THEME', payload: key as any })}
                  >
                    <div
                      className="w-full h-4 rounded"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                      }}
                    />
                    <span className="text-sm font-medium">{theme.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personality Selection */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-4 w-4" />
                AI Personality
              </CardTitle>
              <CardDescription className="text-gray-300">
                How should your AI friend behave?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={state.botPersonality}
                onValueChange={(value) => dispatch({ type: 'CHANGE_PERSONALITY', payload: value as any })}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-xl border-white/20">
                  {Object.entries(personalities).map(([key, personality]) => (
                    <SelectItem key={key} value={key} className="text-white hover:bg-white/10">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{personality.name}</span>
                        <span className="text-xs text-gray-400">{personality.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-400 mt-2">
                {currentPersonality.description}
              </p>
            </CardContent>
          </Card>

          {/* Conversation Mode */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquare className="h-4 w-4" />
                Conversation Mode
              </CardTitle>
              <CardDescription className="text-gray-300">
                Set the focus of your conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(conversationModes).map(([key, mode]) => (
                  <Button
                    key={key}
                    variant={state.conversationMode === key ? "default" : "outline"}
                    className="h-auto p-3 flex flex-col gap-1 text-left"
                    style={{
                      backgroundColor: state.conversationMode === key ? currentTheme.colors.primary : 'transparent',
                      borderColor: currentTheme.colors.primary,
                    }}
                    onClick={() => dispatch({ type: 'CHANGE_MODE', payload: key as any })}
                  >
                    <span className="text-lg">{mode.icon}</span>
                    <span className="text-xs font-medium">{mode.name}</span>
                  </Button>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {currentMode.description}
              </p>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="h-4 w-4" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <span className="text-sm">Voice Responses</span>
                </div>
                <Switch
                  checked={state.userPreferences.voiceEnabled}
                  onCheckedChange={(checked) =>
                    dispatch({ type: 'UPDATE_PREFERENCES', payload: { voiceEnabled: checked } })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">Smooth Animations</span>
                </div>
                <Switch
                  checked={state.userPreferences.animations}
                  onCheckedChange={(checked) =>
                    dispatch({ type: 'UPDATE_PREFERENCES', payload: { animations: checked } })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm">Particle Effects</span>
                </div>
                <Switch
                  checked={state.userPreferences.particleEffects}
                  onCheckedChange={(checked) =>
                    dispatch({ type: 'UPDATE_PREFERENCES', payload: { particleEffects: checked } })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm">Current Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" style={{ backgroundColor: currentTheme.colors.primary, color: 'white' }}>
                  {currentTheme.name}
                </Badge>
                <Badge variant="outline" className="border-white/20 text-white">
                  {currentPersonality.name}
                </Badge>
                <Badge variant="outline" className="border-white/20 text-white">
                  {currentMode.name}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
