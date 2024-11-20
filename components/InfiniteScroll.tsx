import { useEffect, useRef, useState } from 'react';

interface InfiniteScrollProps {
  loadMore: () => Promise<void>;
  hasMore: boolean;
  children: React.ReactNode;
}

export function InfiniteScroll({ loadMore, hasMore, children }: InfiniteScrollProps) {
  const [loading, setLoading] = useState(false);
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setLoading(true);
          loadMore().finally(() => setLoading(false));
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadMore, loading]);

  return (
    <>
      {children}
      {hasMore && <div ref={observerTarget} style={{ height: '1px' }} />}
    </>
  );
}