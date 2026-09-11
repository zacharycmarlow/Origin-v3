/**
 * Global keyboard shortcuts for The Origin.
 *
 *   Ctrl+Right  → next chapter
 *   Ctrl+Left   → previous chapter
 *   Ctrl+S      → save (prevents the browser's default save dialog)
 *   Escape      → close the active overlay
 *
 * Pass `undefined` for any callback you don't want to wire up.
 */
import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface ShortcutHandlers {
  onNext?: () => void;
  onPrev?: () => void;
  onSave?: () => void;
  onClose?: () => void;
}

export function useKeyboardShortcuts({
  onNext,
  onPrev,
  onSave,
  onClose,
}: ShortcutHandlers): void {
  const handleNext = useCallback(() => {
    onNext?.();
  }, [onNext]);

  const handlePrev = useCallback(() => {
    onPrev?.();
  }, [onPrev]);

  const handleSave = useCallback(
    (e: KeyboardEvent) => {
      // Prevent the browser's native "Save Page" dialog.
      e.preventDefault();
      onSave?.();
    },
    [onSave],
  );

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useHotkeys("ctrl+right, meta+right", handleNext, { enableOnFormTags: false });
  useHotkeys("ctrl+left, meta+left", handlePrev, { enableOnFormTags: false });
  useHotkeys("ctrl+s, meta+s", handleSave, { preventDefault: true, enableOnFormTags: true });
  useHotkeys("escape", handleClose, { enableOnFormTags: false });
}
