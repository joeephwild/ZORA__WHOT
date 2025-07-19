'use client';

import { useEffect, useRef } from 'react';

type AudioEvent = 'play' | 'draw' | 'shuffle' | 'win' | 'lose' | 'invalid' | null;

interface GameSoundsProps {
  event: AudioEvent;
  onEnd: () => void;
}

const useAudio = (url: string, options: { loop?: boolean; volume?: number } = {}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // This effect runs only on the client
    const audio = new Audio(url);
    audio.loop = options.loop || false;
    audio.volume = options.volume || 1;
    audioRef.current = audio;

    return () => {
      // Cleanup on unmount
      audio.pause();
      audio.src = '';
    };
  }, [url, options.loop, options.volume]);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => console.error(`Audio play error for ${url}:`, error));
    }
  };
  
  const pause = () => {
    if(audioRef.current) {
        audioRef.current.pause();
    }
  }

  return { play, pause };
};


export default function GameSounds({ event, onEnd }: GameSoundsProps) {
  const { play: playCardSound } = useAudio('/sounds/card-play.mp3');
  const { play: playDrawSound } = useAudio('/sounds/card-draw.mp3');
  const { play: playShuffleSound } = useAudio('/sounds/card-shuffle.mp3');
  const { play: playWinSound } = useAudio('/sounds/game-win.mp3');
  const { play: playLoseSound } = useAudio('/sounds/game-lose.mp3');
  const { play: playInvalidSound } = useAudio('/sounds/invalid-move.mp3');

  const { play: playBackgroundMusic, pause: pauseBackgroundMusic } = useAudio('/sounds/background-music.mp3', { loop: true, volume: 0.1 });

  // Handle background music
  useEffect(() => {
    playBackgroundMusic();
    return () => {
      pauseBackgroundMusic();
    };
  }, [playBackgroundMusic, pauseBackgroundMusic]);

  // Handle sound effects
  useEffect(() => {
    if (!event) return;

    const soundMap: Record<AudioEvent & string, () => void> = {
      play: playCardSound,
      draw: playDrawSound,
      shuffle: playShuffleSound,
      win: playWinSound,
      lose: playLoseSound,
      invalid: playInvalidSound,
    };
    
    const soundToPlay = soundMap[event];
    if (soundToPlay) {
      soundToPlay();
    }
    
    // Notify parent that the sound has been triggered so it can reset the event
    onEnd(); 
  }, [event, onEnd, playCardSound, playDrawSound, playShuffleSound, playWinSound, playLoseSound, playInvalidSound]);

  return null; // This component does not render anything
}
