import { useState, useCallback, useRef } from 'react';

const BUFFER_ROWS = 5;

interface UseVirtualScrollOptions {
  rowHeight: number;
  totalRows: number;
}

interface UseVirtualScrollResult {
  scrollTop: number;
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  scrollerRef: React.RefObject<HTMLDivElement>;
}

export function useVirtualScroll({
  rowHeight,
  totalRows,
}: UseVirtualScrollOptions): UseVirtualScrollResult {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.currentTarget as HTMLDivElement).scrollTop);
  }, []);

  const viewportHeight = scrollerRef.current?.clientHeight ?? 600;

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - BUFFER_ROWS);
  const endIndex   = Math.min(
    totalRows - 1,
    Math.ceil((scrollTop + viewportHeight) / rowHeight) + BUFFER_ROWS
  );

  return {
    scrollTop,
    startIndex,
    endIndex,
    totalHeight: totalRows * rowHeight,
    onScroll,
    scrollerRef,
  };
}
