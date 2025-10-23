import { useMemo, useRef } from 'react';
import { getParentWindow, isTouchEvent } from './GxColorPicker.helpers';

export const useInteractiveColorPicker = (
  paletteElement: HTMLDivElement | null,
  handlePaletteChange: (event: MouseEvent | TouchEvent) => void
) => {
  const isTouch = useRef(false);

  const [handleMoveStart, toggleDocumentEvents] = useMemo(() => {
    const handleMoveStart = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
      if (!paletteElement) return;

      if (!isTouch && nativeEvent.cancelable) {
        nativeEvent.preventDefault();
        nativeEvent.stopPropagation();
      }

      if (isTouchEvent(nativeEvent)) isTouch.current = true;
      handlePaletteChange(nativeEvent);
      toggleDocumentEvents(true);
    };

    const handleMove = (event: MouseEvent | TouchEvent) => {
      if (!paletteElement) return;

      if (!isTouch && event.cancelable) {
        event.preventDefault();
        event.stopPropagation();
      }

      const isDown = isTouchEvent(event) ? event.touches.length > 0 : event.buttons > 0;

      if (isDown && paletteElement) {
        handlePaletteChange(event);
      } else {
        toggleDocumentEvents(false);
      }
    };

    const handleMoveEnd = () => toggleDocumentEvents(false);

    const toggleDocumentEvents = (state?: boolean) => {
      if (!paletteElement) return;
      const parentWindow = getParentWindow(paletteElement);

      const toggleEvent = state ? parentWindow.addEventListener : parentWindow.removeEventListener;
      toggleEvent(isTouch.current ? 'touchmove' : 'mousemove', handleMove);
      toggleEvent(isTouch.current ? 'touchend' : 'mouseup', handleMoveEnd);
    };

    return [handleMoveStart, toggleDocumentEvents];
  }, [paletteElement, handlePaletteChange]);

  return {
    handleMoveStart,
    toggleDocumentEvents
  };
};
