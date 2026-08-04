import { useCallback, useEffect, useRef, useState } from 'react';
import { Howl, Howler } from 'howler';

export function useAmbientSound() {
  const [soundOn, setSoundOn] = useState(true);
  const ambienceRef = useRef(null);
  const flipSfxRef = useRef(null);

  useEffect(() => {
    const ambience = new Howl({
      src: ['/sounds/ambience_loop.mp3'],
      loop: true,
      volume: 0.35,
      preload: true,
    });
    const flipSfx = new Howl({
      src: ['/sounds/page_turn.mp3'],
      volume: 0.6,
      preload: true,
    });
    ambienceRef.current = ambience;
    flipSfxRef.current = flipSfx;

    ambience.play();

    // Browsers block audio-with-sound from autoplaying until the page has
    // real user interaction. Howler has its own internal unlock listener,
    // but it's opaque and gives no visibility into whether it actually
    // fired, so this is an explicit, first-class fallback: on the first
    // genuine click/tap/keypress anywhere on the page, resume the shared
    // AudioContext and (re)try play(). Both calls are no-ops if audio is
    // already running, so this is safe to fire even when unlocking wasn't
    // actually needed.
    function unlock() {
      if (Howler.ctx && Howler.ctx.state === 'suspended') Howler.ctx.resume();
      if (!ambience.playing()) ambience.play();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    }
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      ambience.unload();
      flipSfx.unload();
    };
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      const ambience = ambienceRef.current;
      if (ambience) {
        if (next) {
          if (Howler.ctx && Howler.ctx.state === 'suspended') Howler.ctx.resume();
          if (!ambience.playing()) ambience.play();
          ambience.fade(ambience.volume(), 0.35, 400);
        } else {
          ambience.fade(ambience.volume(), 0, 400);
        }
      }
      return next;
    });
  }, []);

  const playFlipSound = useCallback(() => {
    if (soundOn) flipSfxRef.current?.play();
  }, [soundOn]);

  return { soundOn, toggleSound, playFlipSound };
}
