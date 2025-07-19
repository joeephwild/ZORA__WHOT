'use client';

import { useEffect } from 'react';
import { useAudio } from '@/hooks/use-audio';

interface GameSoundsProps {
  event: 'play' | 'draw' | 'shuffle' | 'win' | 'lose' | null;
  onEnd: () => void;
}

export default function GameSounds({ event, onEnd }: GameSoundsProps) {
  const { play: playCardSound } = useAudio('/sounds/card-play.mp3');
  const { play: playDrawSound } = useAudio('/sounds/card-draw.mp3');
  const { play: playShuffleSound } = useAudio('/sounds/card-shuffle.mp3');
  const { play: playWinSound } = useAudio('/sounds/game-win.mp3');
  const { play: playLoseSound } = useAudio('/sounds/game-lose.mp3');
  const { play: playBackgroundMusic, playing: musicPlaying, pause: pauseBackgroundMusic } = useAudio('/sounds/background-music.mp3', { loop: true, volume: 0.2 });

  useEffect(() => {
    // Start background music once the component is mounted
    if (!musicPlaying) {
        playBackgroundMusic();
    }
    
    // Cleanup on unmount
    return () => {
        pauseBackgroundMusic();
    }
  }, [playBackgroundMusic, musicPlaying, pauseBackgroundMusic]);
  
  useEffect(() => {
    if (!event) return;

    let soundToPlay: (() => void) | null = null;

    switch (event) {
      case 'play':
        soundToPlay = playCardSound;
        break;
      case 'draw':
        soundToPlay = playDrawSound;
        break;
      case 'shuffle':
        soundToPlay = playShuffleSound;
        break;
      case 'win':
        soundToPlay = playWinSound;
        break;
      case 'lose':
        soundToPlay = playLoseSound;
        break;
      default:
        break;
    }
    
    if (soundToPlay) {
      soundToPlay();
    }
    
    // Notify parent component that the sound has been triggered
    onEnd(); 

  }, [event, onEnd, playCardSound, playDrawSound, playShuffleSound, playWinSound, playLoseSound]);

  return null; // This component does not render anything
}
