import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  History,
  MessageSquare,
  Settings,
  Brain,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "대시보드" },
  { to: "/monitor", icon: Activity, label: "실시간 모니터링" },
  { to: "/emotions", icon: History, label: "감정 이력" },
  { to: "/interventions", icon: MessageSquare, label: "개입/추천" },
  { to: "/settings", icon: Settings, label: "설정" },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <Link to="/" className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border hover:bg-sidebar-accent/50 transition-colors">
        <Brain className="h-7 w-7 text-sidebar-primary" />
        <span className="text-lg font-semibold">EmotionAI</span>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
