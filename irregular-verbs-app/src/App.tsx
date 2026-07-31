import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { PracticePage } from "@/pages/PracticePage";
import { DashboardPage } from "@/pages/DashboardPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { TopicsPage } from "@/pages/TopicsPage";
import { GrammarPracticePage } from "@/pages/GrammarPracticePage";
import { StudySessionPage } from "@/pages/StudySessionPage";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<PracticePage />} />
        <Route path="/topics" element={<TopicsPage />} />
        <Route path="/practice/grammar/:topicId" element={<GrammarPracticePage />} />
        <Route path="/study" element={<StudySessionPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppShell>
  );
}
