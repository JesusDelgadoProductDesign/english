import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeaderboardIdentity } from "@/hooks/useLeaderboardIdentity";
import { generatePlaceholderName } from "@/domain/leaderboard";
import { AuthPanel } from "./AuthPanel";
import { NameModal } from "./NameModal";

/**
 * Runs once per fresh page load: if the visitor isn't really signed in, shows
 * the sign-in popup; once that's dismissed (by any means) or was never shown
 * because they're already signed in, shows the "pick a leaderboard name" step
 * if they don't have one yet. Every visitor ends up with a name — skipping
 * just assigns a placeholder (see leaderboardService), editable later from
 * Settings — so everyone is always represented on the leaderboard.
 */
export function RetentionPrompts() {
  const { user, isLoading: authLoading, isConfigured, isPasswordRecovery } = useAuth();
  const { displayName, isLoading: nameLoading, setDisplayName } = useLeaderboardIdentity();
  const [showLogin, setShowLogin] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const decided = useRef(false);

  useEffect(() => {
    if (!isConfigured || authLoading || nameLoading || isPasswordRecovery || decided.current) return;
    decided.current = true;

    if (!user) {
      setShowLogin(true);
    } else if (!displayName) {
      setShowNameModal(true);
    }
  }, [isConfigured, authLoading, nameLoading, user, displayName]);

  function handleLoginResolved() {
    setShowLogin(false);
    if (!displayName) setShowNameModal(true);
  }

  async function handleNameChosen(name: string | null) {
    setShowNameModal(false);
    try {
      await setDisplayName(name ?? generatePlaceholderName());
    } catch {
      // A leaderboard hiccup shouldn't block the user from practicing.
    }
  }

  if (showLogin) {
    return <AuthPanel onClose={handleLoginResolved} onMaybeLater={handleLoginResolved} />;
  }

  if (showNameModal) {
    return <NameModal onSave={(name) => void handleNameChosen(name)} onSkip={() => void handleNameChosen(null)} />;
  }

  return null;
}
