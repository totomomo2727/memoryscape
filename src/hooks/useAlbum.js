import { useCallback, useEffect, useRef, useState } from 'react';
import { uid } from '../lib/id';

const STORAGE_KEY = 'summer-album-v1';

function makeSlot() {
  return { id: uid('slot'), photo: null, note: '' };
}

function makePage() {
  return { id: uid('page'), slots: [makeSlot(), makeSlot()] };
}

function defaultAlbum() {
  return {
    dateRange: '',
    pages: [makePage(), makePage()],
  };
}

function loadAlbum() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAlbum();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.pages) || parsed.pages.length === 0) {
      return defaultAlbum();
    }
    return parsed;
  } catch {
    return defaultAlbum();
  }
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useAlbum() {
  const [album, setAlbum] = useState(loadAlbum);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(album));
    } catch {
      // Storage full or unavailable (e.g. large photo set) — proceed without persisting.
    }
  }, [album]);

  const setDateRange = useCallback((dateRange) => {
    setAlbum((prev) => ({ ...prev, dateRange }));
  }, []);

  const addSpread = useCallback(() => {
    setAlbum((prev) => ({ ...prev, pages: [...prev.pages, makePage(), makePage()] }));
  }, []);

  const setSlotNote = useCallback((pageId, slotId, note) => {
    setAlbum((prev) => ({
      ...prev,
      pages: prev.pages.map((page) =>
        page.id !== pageId
          ? page
          : {
              ...page,
              slots: page.slots.map((slot) => (slot.id === slotId ? { ...slot, note } : slot)),
            }
      ),
    }));
  }, []);

  const clearSlotPhoto = useCallback((pageId, slotId) => {
    setAlbum((prev) => ({
      ...prev,
      pages: prev.pages.map((page) =>
        page.id !== pageId
          ? page
          : {
              ...page,
              slots: page.slots.map((slot) => (slot.id === slotId ? { ...slot, photo: null } : slot)),
            }
      ),
    }));
  }, []);

  const setSlotPhoto = useCallback((pageId, slotId, dataUrl) => {
    setAlbum((prev) => ({
      ...prev,
      pages: prev.pages.map((page) =>
        page.id !== pageId
          ? page
          : {
              ...page,
              slots: page.slots.map((slot) => (slot.id === slotId ? { ...slot, photo: dataUrl } : slot)),
            }
      ),
    }));
  }, []);

  const addPhotoFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    const dataUrls = await Promise.all(files.map(readAsDataURL));

    setAlbum((prev) => {
      const nextPages = prev.pages.map((page) => ({
        ...page,
        slots: page.slots.map((slot) => ({ ...slot })),
      }));

      const emptyLocations = [];
      nextPages.forEach((page) => {
        page.slots.forEach((slot) => {
          if (!slot.photo) emptyLocations.push({ pageId: page.id, slotId: slot.id });
        });
      });

      while (emptyLocations.length < dataUrls.length) {
        const a = makePage();
        const b = makePage();
        nextPages.push(a, b);
        [a, b].forEach((page) => {
          page.slots.forEach((slot) => emptyLocations.push({ pageId: page.id, slotId: slot.id }));
        });
      }

      dataUrls.forEach((url, i) => {
        const loc = emptyLocations[i];
        const page = nextPages.find((p) => p.id === loc.pageId);
        const slot = page.slots.find((s) => s.id === loc.slotId);
        slot.photo = url;
      });

      return { ...prev, pages: nextPages };
    });
  }, []);

  return {
    dateRange: album.dateRange,
    pages: album.pages,
    setDateRange,
    addSpread,
    setSlotPhoto,
    setSlotNote,
    clearSlotPhoto,
    addPhotoFiles,
  };
}
