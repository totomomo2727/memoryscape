import { useRef, useState } from 'react';
import { rotationFor } from '../lib/rotation';
import { washiFor } from '../lib/decor';
import { useStopBookFlip } from '../lib/useStopBookFlip';
import WashiTape from './WashiTape';

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PhotoSlot({ slot, onSetPhoto, onClearPhoto, onSetNote }) {
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const rotation = rotationFor(slot.id);
  const tape = washiFor(slot.id);
  // Local while typing, committed on blur -- see the matching comment in
  // CoverPage.jsx for why syncing every keystroke straight to shared state
  // breaks focus inside react-pageflip's pages.
  const [localNote, setLocalNote] = useState(slot.note);

  useStopBookFlip(wrapperRef);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const dataUrl = await readAsDataURL(file);
      onSetPhoto(dataUrl);
    }
    e.target.value = '';
  }

  return (
    <div ref={wrapperRef} className="flex h-full flex-col gap-1">
      <div
        className="relative min-h-0 flex-1 rounded-[2px] bg-ivory shadow-[0_4px_10px_rgba(74,56,38,0.35)] transition-transform"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {slot.photo ? (
          <>
            <WashiTape kind={tape.kind} corner={tape.corner} rotate={tape.rotate} />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="block h-full w-full overflow-hidden rounded-[2px] border-4 border-ivory p-0"
              title="Click to replace photo"
            >
              <img src={slot.photo} alt="" className="h-full w-full object-cover" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClearPhoto();
              }}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-sm leading-none text-ivory shadow"
              title="Remove photo"
            >
              ×
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-[2px] border-2 border-dashed border-ink-soft/40 text-ink-soft/70 hover:border-terracotta hover:text-terracotta"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="font-hand text-sm">add photo</span>
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      <textarea
        value={localNote}
        onChange={(e) => setLocalNote(e.target.value)}
        onBlur={() => onSetNote(localNote)}
        placeholder="write a little note..."
        rows={1}
        className="font-script h-7 w-full shrink-0 resize-none border-none bg-transparent text-lg leading-7 text-ink placeholder:text-ink-soft/50 focus:outline-none"
      />
    </div>
  );
}
