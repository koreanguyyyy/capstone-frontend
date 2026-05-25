import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Dashboard from "@/pages/Dashboard";
import EmotionHistory from "@/pages/EmotionHistory";
import Interventions from "@/pages/Interventions";
import Settings from "@/pages/Settings";

export default function App() {
  const { dark, toggle } = useTheme();

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header dark={dark} onToggleTheme={toggle} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/emotions" element={<EmotionHistory />} />
              <Route path="/interventions" element={<Interventions />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
