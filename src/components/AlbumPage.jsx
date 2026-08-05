import { forwardRef } from 'react';
import { backgroundForPage } from '../lib/spreadImages';
import PhotoSlot from './PhotoSlot';

const AlbumPage = forwardRef(function AlbumPage({ page, pageNumber, onSetPhoto, onClearPhoto, onSetNote }, ref) {
  const bgImage = backgroundForPage(pageNumber);

  return (
    <div ref={ref} className="relative flex h-full w-full flex-col px-6 pb-5 pt-3">
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="relative flex min-h-0 flex-1 flex-row gap-4">
        {page.slots.map((slot) => (
          <div key={slot.id} className="min-w-0 flex-1">
            <PhotoSlot
              slot={slot}
              onSetPhoto={(dataUrl) => onSetPhoto(page.id, slot.id, dataUrl)}
              onClearPhoto={() => onClearPhoto(page.id, slot.id)}
              onSetNote={(note) => onSetNote(page.id, slot.id, note)}
            />
          </div>
        ))}
      </div>
      <span className="font-hand pointer-events-none absolute bottom-1.5 left-2 text-sm text-ink-soft/70 [text-shadow:0_1px_2px_rgba(255,255,255,0.6)]">
        {pageNumber}
      </span>
    </div>
  );
});

export default AlbumPage;
