import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { MODULES } from '../config/modules';
import { useAuth } from '../context/AuthContext';

/**
 * Responsive top navigation. Tabs are generated from the module registry, so a
 * new module appears here automatically. The active tab is highlighted via
 * NavLink's `isActive`.
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/70 backdrop-blur-xl">
      <nav
        className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <NavLink to="/" className="rounded-xl" aria-label="CampusBuddy home">
          <Logo />
        </NavLink>

        {/* --- desktop tabs --- */}
        <ul className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-lg lg:flex">
          {MODULES.map((module) => (
            <li key={module.key}>
              <NavLink to={module.path} className={tabClass}>
                {({ isActive }) => (
                  <>
                    <span aria-hidden="true" className="text-base">
                      {module.icon}
                    </span>
                    <span>{module.label}</span>
                    {module.status === 'coming-soon' && (
                      <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Soon
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-brand-400 to-accent-400" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          {user && (
            <div className="flex items-center gap-3">
              <span className="chip">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {user.role === 'admin' ? 'Welcome Admin' : 'Welcome Student'}
              </span>
              <button type="button" onClick={() => { logout(); navigate('/login'); }} className="btn-ghost px-3 py-2">
                Logout
              </button>
            </div>
          )}
        </div>

        {/* --- mobile toggle --- */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {/* --- mobile drawer --- */}
      <div
        id="mobile-nav"
        className={`overflow-hidden border-t border-white/10 transition-[max-height,opacity] duration-300 lg:hidden ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="space-y-1 px-4 py-3">
          {user && (
            <li className="mb-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
              <div className="font-semibold">{user.role === 'admin' ? 'Welcome Admin' : 'Welcome Student'}</div>
              <button type="button" onClick={() => { logout(); navigate('/login'); }} className="mt-2 btn-ghost w-full justify-center">
                Logout
              </button>
            </li>
          )}
          {MODULES.map((module) => (
            <li key={module.key}>
              <NavLink
                to={module.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600/30 to-accent-500/20 text-white ring-1 ring-brand-400/40'
                      : 'text-slate-300 hover:bg-white/5'
                  }`
                }
              >
                <span aria-hidden="true" className="text-lg">
                  {module.icon}
                </span>
                <span className="flex-1">
                  {module.label}
                  <span className="block text-[11px] font-normal text-slate-500">
                    {module.tagline}
                  </span>
                </span>
                {module.status === 'coming-soon' && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-400">
                    Soon
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

function tabClass({ isActive }) {
  return `relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
    isActive
      ? 'bg-gradient-to-r from-brand-600/40 to-accent-500/25 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]'
      : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
  }`;
}
