export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="stream-skeleton" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="stream-skeleton__card" />
      ))}
    </div>
  );
}
