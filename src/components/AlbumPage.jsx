import { forwardRef } from 'react';
import { backgroundForPage } from '../lib/spreadImages';
import PhotoSlot from './PhotoSlot';

const AlbumPage = forwardRef(function AlbumPage({ page, pageNumber, onSetPhoto, onClearPhoto, onSetNote }, ref) {
  const bgImage = backgroundForPage(pageNumber);

  return (
    <div ref={ref} className="relative h-full w-full">
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      {/* react-pageflip forces `display: block` as an inline style on the
          ref'd element above, which always wins over the `flex` utility
          class regardless of specificity. The actual flex layout lives on
          this separate inner child instead, which the library never touches. */}
      <div className="relative flex h-full w-full flex-col px-5 pb-5 pt-3">
        <div className="relative flex min-h-0 flex-1 flex-row gap-4">
          {page.slots.map((slot) => (
            <div key={slot.id} className="min-h-0 min-w-0 flex-1">
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
    </div>
  );
});

export default AlbumPage;
