import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/contexts/AuthContext";
import { AuthPanel } from "@/features/auth/AuthPanel";
import { ResetPasswordPanel } from "@/features/auth/ResetPasswordPanel";

const NAV_ITEMS = [
  { to: "/", label: "Practice", icon: "📝", end: true },
  { to: "/dashboard", label: "Dashboard", icon: "📊", end: false },
  { to: "/settings", label: "Settings", icon: "⚙️", end: false },
];

function navLinkClass(isActive: boolean): string {
  return `flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors sm:flex-row sm:gap-2 sm:text-sm ${
    isActive
      ? "bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
      : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
  }`;
}

function AccountControl() {
  const { user, isSyncing, isConfigured, signOut } = useAuth();
  const [panelOpen, setPanelOpen] = useState(false);

  if (!isConfigured) return null;

  if (isSyncing) {
    return <span className="text-xs text-slate-400">Syncing…</span>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="hidden max-w-[10ch] truncate text-slate-500 sm:inline" title={user.email ?? undefined}>
          {user.email}
        </span>
        <button
          type="button"
          onClick={() => void signOut()}
          className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        className="rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/30"
      >
        Sign in to sync
      </button>
      {panelOpen && <AuthPanel onClose={() => setPanelOpen(false)} />}
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { gamification } = useGamification();
  const { isPasswordRecovery } = useAuth();

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col pb-20 sm:pb-0">
      <a href="#main-content" className="sr-only-focusable fixed left-2 top-2 z-50 rounded bg-white px-3 py-2 shadow">
        Skip to content
      </a>

      {isPasswordRecovery && <ResetPasswordPanel />}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <span className="text-lg font-bold text-brand-700 dark:text-brand-300">Verbly</span>
          {gamification && (
            <div className="flex items-center gap-3 text-sm">
              <span title="Level" aria-label={`Level ${gamification.level}`}>
                🎯 {gamification.level}
              </span>
              <span title="Streak" aria-label={`${gamification.currentStreakDays} day streak`}>
                🔥 {gamification.currentStreakDays}
              </span>
              <span title="XP" aria-label={`${gamification.xp} experience points`}>
                ⭐ {gamification.xp}
              </span>
            </div>
          )}
          <AccountControl />
          <nav aria-label="Primary" className="hidden gap-1 sm:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => navLinkClass(isActive)}>
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1 px-4 py-6">
        {children}
      </main>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-slate-200 bg-white py-1 dark:border-slate-800 dark:bg-slate-900 sm:hidden"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => navLinkClass(isActive)}>
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
