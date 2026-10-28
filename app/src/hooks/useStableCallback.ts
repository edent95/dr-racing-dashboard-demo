import { useCallback, useEffect, useRef } from 'react';

/**
 * A callback with a stable identity that always calls the latest `callback`.
 * Moved unchanged from App.tsx so the extracted hooks can share it.
 */
export function useStableCallback<T extends (...args: never[]) => unknown>(callback: T): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(((...args: Parameters<T>) => (
    callbackRef.current(...args)
  )) as unknown as T, []);
}
