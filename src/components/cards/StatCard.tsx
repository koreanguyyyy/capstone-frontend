import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
}

export default function StatCard({ title, value, subtitle, icon: Icon, iconColor }: Props) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: iconColor ? `${iconColor}20` : undefined }}
        >
          <Icon className="h-6 w-6" style={{ color: iconColor }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
