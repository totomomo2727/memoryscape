import { useEffect, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { useAlbum } from '../hooks/useAlbum';
import { useAmbientSound } from '../hooks/useAmbientSound';
import CoverPage from './CoverPage';
import AlbumPage from './AlbumPage';
import SoundToggle from './SoundToggle';
import Button from './Button';

export default function Album() {
  const album = useAlbum();
  const { soundOn, toggleSound, playFlipSound } = useAmbientSound();
  const bookRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [ready, setReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalPages = album.pages.length + 1;

  function flipNext() {
    bookRef.current?.pageFlip()?.flipNext();
  }

  function handleFlip(e) {
    setCurrentPage(e.data);
  }

  // onFlip only fires once the flip animation has finished, which made the
  // sound noticeably lag behind the visual turn. onChangeState fires as soon
  // as the flip starts (state 'flipping'), so the sound now plays in sync
  // with the page actually moving.
  function handleChangeState(e) {
    if (e.data === 'flipping') playFlipSound();
  }

  function handleFilesSelected(e) {
    if (e.target.files?.length) album.addPhotoFiles(e.target.files);
    e.target.value = '';
  }

  function handleDragEnter(e) {
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragging(true);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDragLeave(e) {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files?.length) album.addPhotoFiles(e.dataTransfer.files);
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-cream px-4 py-10">
      <header className="text-center">
        <h1 className="font-title text-6xl text-ink">Memoryscape</h1>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink-soft/70">
          your digital photo album
        </p>
      </header>

      <div
        className="group relative mx-auto w-full transition-transform duration-500 ease-in-out"
        style={{
          maxWidth: 1200,
          aspectRatio: '3 / 1',
          transform: currentPage === 0 ? 'translateX(-25%)' : 'translateX(0)',
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="font-mono pointer-events-none absolute inset-0 z-20 flex items-center justify-center border-4 border-dashed border-terracotta bg-ivory/80 text-sm uppercase tracking-[0.2em] text-terracotta">
            drop your photos here
          </div>
        )}

        {!ready && (
          <div
            className="font-mono mx-auto flex items-center justify-center text-xs uppercase tracking-[0.2em] text-ink-soft/60"
            style={{ maxWidth: 720, aspectRatio: '3 / 2' }}
          >
            opening the album...
          </div>
        )}

        {ready && (
          <>
            <HTMLFlipBook
              ref={bookRef}
              width={540}
              height={360}
              size="stretch"
              minWidth={270}
              maxWidth={810}
              minHeight={180}
              maxHeight={540}
              disableFlipByClick
              showCover
              usePortrait={false}
              maxShadowOpacity={0.4}
              flippingTime={700}
              className="mx-auto"
              onFlip={handleFlip}
              onChangeState={handleChangeState}
            >
              <CoverPage dateRange={album.dateRange} onDateRangeChange={album.setDateRange} />
              {album.pages.map((page, i) => (
                <AlbumPage
                  key={page.id}
                  page={page}
                  pageNumber={i + 1}
                  onSetPhoto={album.setSlotPhoto}
                  onClearPhoto={album.clearSlotPhoto}
                  onSetNote={album.setSlotNote}
                />
              ))}
            </HTMLFlipBook>

            {currentPage < totalPages - 1 && (
              <button
                type="button"
                onClick={flipNext}
                aria-label="Flip to next page"
                className="absolute bottom-0 right-0 z-10 h-14 w-14 origin-bottom-right cursor-pointer transition-transform duration-300 ease-out group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105"
                style={{
                  background:
                    'linear-gradient(135deg, transparent 50%, rgba(74,56,38,0.28) 50.5%, rgba(74,56,38,0.12) 100%)',
                  clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)',
                }}
              />
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {currentPage > 0 && (
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
            page {currentPage} of {totalPages - 1}
          </span>
        )}
        <SoundToggle soundOn={soundOn} onToggle={toggleSound} />
        {currentPage > 0 && (
          <>
            <Button onClick={() => fileInputRef.current?.click()}>+ add photos</Button>
            <Button onClick={album.addSpread}>+ add spread</Button>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
      </div>
    </div>
  );
}
