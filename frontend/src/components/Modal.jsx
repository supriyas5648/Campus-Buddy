export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/80 px-4 py-6 backdrop-blur-sm">
      <div className="glass-strong w-full max-w-2xl p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button type="button" className="btn-ghost px-2 py-1 text-sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
