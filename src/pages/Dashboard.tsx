import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain, AlertTriangle, Smile } from "lucide-react";
import StatCard from "@/components/cards/StatCard";
import RecommendationCard from "@/components/cards/RecommendationCard";
import EmotionDistribution from "@/components/charts/EmotionDistribution";
import StressTrend from "@/components/charts/StressTrend";
import { getEmotionLogs } from "@/api/emotion";
import { getInterventions } from "@/api/intervention";
import type { EmotionLog, Intervention } from "@/types";
import { EMOTION_LABELS } from "@/types";
import {
  format,
  subDays,
  startOfDay,
  isAfter,
  parseISO,
  isSameDay,
} from "date-fns";

const USER_ID = Number(import.meta.env.VITE_USER_ID) || 1;

export default function Dashboard() {
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getEmotionLogs(USER_ID).catch(() => [] as EmotionLog[]),
      getInterventions(USER_ID, 3).catch(() => [] as Intervention[]),
    ])
      .then(([l, i]) => {
        setLogs(l);
        setInterventions(i);
      })
      .finally(() => setLoading(false));
  }, []);

  const today = startOfDay(new Date());
  const todayLogs = logs.filter((l) => isSameDay(parseISO(l.detectedAt), today));

  const totalDetections = todayLogs.length;
  const avgStress =
    todayLogs.length > 0
      ? todayLogs.reduce((s, l) => s + (l.finalStressLevel ?? 0), 0) / todayLogs.length
      : 0;
  const todayInterventions = interventions.filter((i) =>
    isSameDay(parseISO(i.createdAt), today)
  ).length;

  const emotionCounts: Record<string, number> = {};
  todayLogs.forEach((l) => {
    const e = (l.primaryEmotion ?? l.faceEmotion ?? "neutral").toLowerCase();
    emotionCounts[e] = (emotionCounts[e] || 0) + 1;
  });

  const topEmotion =
    Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

  const distributionData = Object.entries(emotionCounts).map(
    ([emotion, count]) => ({ emotion, count })
  );

  const sevenDaysAgo = subDays(today, 6);
  const stressByDay: Record<string, number[]> = {};
  logs.forEach((l) => {
    const d = parseISO(l.detectedAt);
    if (isAfter(d, subDays(sevenDaysAgo, 1))) {
      const key = format(d, "MM/dd");
      if (!stressByDay[key]) stressByDay[key] = [];
      stressByDay[key].push(l.finalStressLevel ?? 0);
    }
  });

  const stressTrend = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const key = format(d, "MM/dd");
    const vals = stressByDay[key] ?? [];
    return {
      date: key,
      avgStress: vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0,
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="오늘 총 감지"
          value={totalDetections}
          icon={Activity}
          iconColor="#4A90E2"
        />
        <StatCard
          title="평균 스트레스"
          value={avgStress.toFixed(1)}
          subtitle="/ 10"
          icon={AlertTriangle}
          iconColor="#E74C3C"
        />
        <StatCard
          title="오늘 개입"
          value={todayInterventions}
          icon={Brain}
          iconColor="#9B59B6"
        />
        <StatCard
          title="최다 감정"
          value={EMOTION_LABELS[topEmotion] ?? topEmotion}
          icon={Smile}
          iconColor="#FFD700"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">최근 7일 스트레스 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <StressTrend data={stressTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">오늘 감정 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <EmotionDistribution data={distributionData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">최근 개입</CardTitle>
        </CardHeader>
        <CardContent>
          {interventions.length === 0 ? (
            <p className="text-sm text-muted-foreground">개입 이력이 없습니다</p>
          ) : (
            <div className="space-y-4">
              {interventions.slice(0, 3).map((iv) => (
                <div key={iv.interventionId} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {format(parseISO(iv.createdAt), "yyyy-MM-dd HH:mm")}
                    </span>
                    {iv.interventionRating && (
                      <span className="text-xs text-muted-foreground">
                        {iv.interventionRating}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{iv.agentMessage}</p>
                  {iv.recommendations.length > 0 && (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {iv.recommendations.map((rec) => (
                        <RecommendationCard key={rec.recommendationId} rec={rec} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
