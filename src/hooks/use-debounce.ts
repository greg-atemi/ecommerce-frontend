import { useState, useEffect } from "react";

/**
 * Returns a debounced version of `value` that only updates
 * after `delay` ms have elapsed since the last change.
 * Great for search inputs to avoid firing on every keystroke.
 *
 * @example
 * const debouncedSearch = useDebounce(searchQuery, 300);
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
