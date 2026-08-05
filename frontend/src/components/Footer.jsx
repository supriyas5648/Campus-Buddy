/**
 * Slim application footer.
 */
export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-950/60 backdrop-blur-lg">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <p>
          &copy; {new Date().getFullYear()} CampusBuddy — helping students find their way around
          campus.
        </p>
        <p className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          Map Buddy is live · more modules on the way
        </p>
      </div>
    </footer>
  );
}
