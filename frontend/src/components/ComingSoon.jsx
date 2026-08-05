import { Link } from 'react-router-dom';
import { DEFAULT_MODULE_PATH } from '../config/modules';

/**
 * Shared placeholder for modules that are not built yet.
 *
 * @param {{
 *   icon: string,
 *   title: string,
 *   tagline: string,
 *   description: string,
 *   features: Array<{ icon: string, title: string, description: string }>,
 *   accent?: string
 * }} props
 */
export default function ComingSoon({
  icon,
  title,
  tagline,
  description,
  features = [],
  accent = 'from-brand-500/25 to-accent-500/15',
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      {/* Hero */}
      <div className="glass relative overflow-hidden p-8 text-center sm:p-14">
        <div
          className={`pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-br ${accent} blur-3xl`}
          aria-hidden="true"
        />

        <div className="relative">
          <span className="mx-auto mb-6 grid h-20 w-20 animate-float place-items-center rounded-3xl border border-white/10 bg-white/5 text-4xl shadow-glass">
            {icon}
          </span>

          <span className="chip mb-4 !border-brand-400/30 !bg-brand-400/10 !text-brand-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
            Coming Soon
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">
            {tagline}
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400">
            {description}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to={DEFAULT_MODULE_PATH} className="btn-primary">
              <span aria-hidden="true">🗺</span>
              Open Map Buddy
            </Link>
            <span className="btn-ghost cursor-default">In development</span>
          </div>
        </div>
      </div>

      {/* Planned features */}
      {features.length > 0 && (
        <>
          <h2 className="mb-4 mt-12 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            What's planned
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass group animate-fade-in p-5 transition-colors hover:border-brand-400/30"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-xl ring-1 ring-white/10 transition group-hover:bg-brand-500/15 group-hover:ring-brand-400/30">
                    {feature.icon}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{feature.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
