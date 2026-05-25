import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, type PieLabelRenderProps } from "recharts";
import { EMOTION_COLORS, EMOTION_LABELS } from "@/types";

interface Props {
  data: { emotion: string; count: number }[];
}

export default function EmotionDistribution({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        데이터가 없습니다
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          dataKey="count"
          nameKey="emotion"
          paddingAngle={2}
          label={(props: PieLabelRenderProps & { emotion?: string }) => {
            const emotion = String(props.emotion ?? "");
            const percent = Number(props.percent ?? 0);
            return `${EMOTION_LABELS[emotion] ?? emotion} ${(percent * 100).toFixed(0)}%`;
          }}
        >
          {data.map((entry) => (
            <Cell
              key={entry.emotion}
              fill={EMOTION_COLORS[entry.emotion] ?? "#95A5A6"}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: unknown, name: unknown) => [
            `${value}건`,
            EMOTION_LABELS[String(name)] ?? String(name),
          ]}
        />
        <Legend
          formatter={(value: string) => EMOTION_LABELS[value] ?? value}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
