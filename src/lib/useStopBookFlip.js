import { useEffect } from 'react';

// react-pageflip attaches its own mousedown/touchstart listener directly on the
// book's root element. That native listener fires during the real bubble phase
// before React's root-delegated synthetic events run, so calling
// e.stopPropagation() from a React onMouseDown prop is too late to stop it.
// Attaching a real native listener on the interactive area itself runs first
// and reliably blocks the book from starting a fold/flip gesture.
export function useStopBookFlip(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    function stop(e) {
      e.stopPropagation();
    }

    el.addEventListener('mousedown', stop);
    el.addEventListener('touchstart', stop, { passive: true });
    return () => {
      el.removeEventListener('mousedown', stop);
      el.removeEventListener('touchstart', stop);
    };
  }, [ref]);
}
