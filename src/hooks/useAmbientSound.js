import { useCallback, useEffect, useRef, useState } from 'react';
import { Howl, Howler } from 'howler';

const AMBIENCE_VOLUME = 0.35;

export function useAmbientSound() {
  const [soundOn, setSoundOn] = useState(true);
  const soundOnRef = useRef(true);
  const ambienceRef = useRef(null);
  const flipSfxRef = useRef(null);

  useEffect(() => {
    const ambience = new Howl({
      src: ['/sounds/ambience_loop.mp3'],
      loop: true,
      volume: AMBIENCE_VOLUME,
      preload: true,
    });
    const flipSfx = new Howl({
      src: ['/sounds/page_turn.mp3'],
      volume: 0.6,
      preload: true,
    });
    ambienceRef.current = ambience;
    flipSfxRef.current = flipSfx;

    // Belt-and-suspenders: on some autoplay-blocked/unlock races, this sound
    // has been observed reporting playing() === true with its volume stuck
    // at 0 (silent-but-"playing"), and 'play' can fire more than once
    // (once while still blocked, again once truly unlocked) so a one-shot
    // fix isn't reliable. Instead, self-heal on every 'play' -- including
    // loop restarts -- correcting the volume back whenever the user wants
    // sound on but it's unexpectedly silent. This never fights a deliberate
    // fade-to-0 from toggling sound off, since it only acts when soundOnRef
    // is true.
    ambience.on('play', () => {
      if (soundOnRef.current && ambience.volume() === 0) {
        ambience.volume(AMBIENCE_VOLUME);
      }
    });
    ambience.play();

    // Browsers block audio-with-sound from autoplaying until the page has
    // real user interaction. Howler has its own internal unlock listener,
    // but it's opaque and gives no visibility into whether it actually
    // fired, so this is an explicit, first-class fallback: on the first
    // genuine click/tap/keypress anywhere on the page, resume the shared
    // AudioContext AND explicitly retry play(). The retry matters: while
    // the context is suspended, Howler appears to never actually schedule
    // the underlying audio source, so resuming the context alone leaves
    // nothing playing -- there has to be a fresh play() call after resume
    // for sound to actually start.
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
      soundOnRef.current = next;
      const ambience = ambienceRef.current;
      if (ambience) {
        if (next) {
          if (Howler.ctx && Howler.ctx.state === 'suspended') Howler.ctx.resume();
          if (!ambience.playing()) ambience.play();
          ambience.fade(ambience.volume(), AMBIENCE_VOLUME, 400);
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
