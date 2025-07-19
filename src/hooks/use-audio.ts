'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAudioOptions {
  volume?: number;
  loop?: boolean;
}

export const useAudio = (url: string, options: UseAudioOptions = {}) => {
  const { volume = 1, loop = false } = options;
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Effect to create and configure the Audio object only on the client
  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    const handleEnded = () => setIsPlaying(false);
    
    audio.addEventListener('ended', handleEnded);
    audio.loop = loop;
    audio.volume = volume;

    // Cleanup function
    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
      audio.src = ''; // Release memory
    };
  }, [url, loop, volume]);

  const play = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
            if (err.name !== 'AbortError') {
                 console.error("Audio play failed:", err)
            }
        });
        setIsPlaying(true);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  return { playing: isPlaying, toggle, play, pause };
};
