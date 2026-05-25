import { useLocation, Link } from "react-router-dom";
import {
  Moon,
  Sun,
  Menu,
  LayoutDashboard,
  History,
  MessageSquare,
  Settings,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const TITLES: Record<string, string> = {
  "/": "대시보드",
  "/emotions": "감정 이력",
  "/interventions": "개입/추천 이력",
  "/settings": "설정",
};

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "대시보드" },
  { to: "/emotions", icon: History, label: "감정 이력" },
  { to: "/interventions", icon: MessageSquare, label: "개입/추천" },
  { to: "/settings", icon: Settings, label: "설정" },
];

interface Props {
  dark: boolean;
  onToggleTheme: () => void;
}

export default function Header({ dark, onToggleTheme }: Props) {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{TITLES[pathname] ?? ""}</h1>
        </div>

        <Button variant="ghost" size="icon" onClick={onToggleTheme}>
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <aside
            className="absolute left-0 top-0 h-full w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
              <Brain className="h-7 w-7 text-sidebar-primary" />
              <span className="text-lg font-semibold">EmotionAI</span>
            </div>
            <nav className="px-3 py-4 space-y-1">
              {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === to
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
