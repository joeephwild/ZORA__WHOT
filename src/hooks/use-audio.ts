'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

interface UseAudioOptions {
  volume?: number;
  loop?: boolean;
}

export const useAudio = (url: string, options: UseAudioOptions = {}) => {
  const { volume = 1, loop = false } = options;
  
  // We use a memoized audio element to prevent re-creation on re-renders.
  // This state holds the Audio object, but only on the client-side.
  const [audio, setAudio] = useState<HTMLAudioElement | undefined>(undefined);
  
  const [playing, setPlaying] = useState(false);

  // Effect to create the Audio object only on the client
  useEffect(() => {
    const audioObj = new Audio(url);
    setAudio(audioObj);
    
    // Cleanup function to pause and nullify on unmount
    return () => {
        audioObj.pause();
    };
  }, [url]);

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
        if(audio.HAVE_NOTHING) { // A quick check to see if audio is loaded
           audio.currentTime = 0;
           audio.play().catch(err => console.error("Audio play failed on retry:", err));
           setPlaying(true);
        }
    }
  }, [audio]);

  const pause = useCallback(() => {
    if(audio) {
      setPlaying(false);
    }
  }, [audio]);
  
  const toggle = useCallback(() => {
    setPlaying(p => !p);
  }, [])

  return { playing, toggle, play, pause };
};
