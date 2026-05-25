import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { date: string; avgStress: number }[];
}

export default function StressTrend({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        데이터가 없습니다
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
        <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--card-foreground)",
          }}
          formatter={(value: unknown) => [`${Number(value).toFixed(1)}`, "평균 스트레스"]}
        />
        <Line
          type="monotone"
          dataKey="avgStress"
          stroke="#E74C3C"
          strokeWidth={2}
          dot={{ r: 4, fill: "#E74C3C" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
