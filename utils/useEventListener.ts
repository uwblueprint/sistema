import { useEffect, useRef } from 'react';

export function useEventListener<K extends keyof DocumentEventMap>(
  eventType: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: Document | HTMLElement = document
) {
  const savedHandler = useRef<(event: DocumentEventMap[K]) => void>();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element) return;
    const eventListener = (event: DocumentEventMap[K]) =>
      savedHandler.current?.(event);
    element.addEventListener(eventType, eventListener);
    return () => {
      element.removeEventListener(eventType, eventListener);
    };
  }, [eventType, element]);
}
