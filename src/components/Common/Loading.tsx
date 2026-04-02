export function Loading() {
  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
      <div className="loading-wrap">
        Loading<span className="spinner" />
      </div>
    </div>
  );
}
