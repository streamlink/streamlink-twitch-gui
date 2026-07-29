import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface LoadMoreProps {
  hasMore: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
}

/** IntersectionObserver sentinel + fallback button for cursor pagination. */
export function LoadMore({ hasMore, isFetching, onLoadMore }: LoadMoreProps) {
  const { t } = useTranslation("common");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isFetching) return;
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          onLoadMore();
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isFetching, onLoadMore]);

  if (!hasMore) return null;

  return (
    <div className="load-more" ref={ref}>
      <button
        type="button"
        className="button-secondary"
        disabled={isFetching}
        onClick={onLoadMore}
      >
        {isFetching ? t("loading") : t("loadMore")}
      </button>
    </div>
  );
}
