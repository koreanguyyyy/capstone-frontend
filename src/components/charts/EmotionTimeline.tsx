import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { EMOTION_COLORS, EMOTION_LABELS } from "@/types";

interface Props {
  data: Record<string, unknown>[];
  emotions: string[];
}

export default function EmotionTimeline({ data, emotions }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        데이터가 없습니다
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--card-foreground)",
          }}
        />
        <Legend formatter={(value: string) => EMOTION_LABELS[value] ?? value} />
        {emotions.map((emotion) => (
          <Bar
            key={emotion}
            dataKey={emotion}
            stackId="emotions"
            fill={EMOTION_COLORS[emotion] ?? "#95A5A6"}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
