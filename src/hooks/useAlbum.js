import { useCallback, useEffect, useRef, useState } from 'react';
import { uid } from '../lib/id';
import { idbGet, idbSet } from '../lib/idbStorage';

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

function isValidAlbum(value) {
  return !!value && Array.isArray(value.pages) && value.pages.length > 0;
}

// One-time migration path: earlier versions of this app stored the whole
// album -- including full-size photo data URLs -- directly in
// localStorage, which only has a ~5-10MB quota. A couple of full-res
// photos could blow past that, and the write failure was silently
// swallowed, so uploaded photos would just vanish on the next visit with
// no warning. IndexedDB has a much larger quota and is what this should
// have used from the start; this pulls over anything already saved under
// the old scheme so it isn't lost in the switch.
function migrateFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidAlbum(parsed) ? parsed : null;
  } catch {
    return null;
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
  const [album, setAlbum] = useState(defaultAlbum);
  const [saveError, setSaveError] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let stored = await idbGet(STORAGE_KEY);
        if (!isValidAlbum(stored)) {
          const legacy = migrateFromLocalStorage();
          if (legacy) {
            stored = legacy;
            await idbSet(STORAGE_KEY, legacy);
          }
        }
        if (!cancelled && isValidAlbum(stored)) {
          setAlbum(stored);
        }
      } catch {
        // IndexedDB unavailable (e.g. private browsing) -- proceed in-memory only.
      } finally {
        if (!cancelled) hasLoadedRef.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    idbSet(STORAGE_KEY, album)
      .then(() => setSaveError(false))
      .catch(() => setSaveError(true));
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
    saveError,
    setDateRange,
    addSpread,
    setSlotPhoto,
    setSlotNote,
    clearSlotPhoto,
    addPhotoFiles,
  };
}
