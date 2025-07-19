'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

interface UseAudioOptions {
  volume?: number;
  loop?: boolean;
}

export const useAudio = (url: string, options: UseAudioOptions = {}) => {
  const { volume = 1, loop = false } = options;
  
  // We use a memoized audio element to prevent re-creation on re-renders.
  // We check for window to ensure it only runs on the client-side.
  const audio = useMemo(() => typeof window !== 'undefined' ? new Audio(url) : undefined, [url]);

  const [playing, setPlaying] = useState(false);

  const toggle = useCallback(() => setPlaying(p => !p), []);

  useEffect(() => {
    if (audio) {
      audio.volume = volume;
      audio.loop = loop;
    }
  }, [audio, volume, loop]);

  useEffect(() => {
    if (audio) {
      playing ? audio.play().catch(err => console.error("Audio play failed:", err)) : audio.pause();
    }
  }, [audio, playing]);

  useEffect(() => {
    const handleEnded = () => setPlaying(false);
    
    if (audio) {
      audio.addEventListener('ended', handleEnded);
      return () => {
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [audio]);

  const play = useCallback(() => {
    if (audio) {
        // If it's already playing, we can reset it to play from the start
        if(playing) {
            audio.currentTime = 0;
        }
        setPlaying(true);
    }
  }, [audio, playing]);

  const pause = useCallback(() => {
    setPlaying(false);
  }, []);

  return { playing, toggle, play, pause };
};
