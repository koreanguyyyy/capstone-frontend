import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EmotionTimeline from "@/components/charts/EmotionTimeline";
import { getEmotionLogs } from "@/api/emotion";
import type { EmotionLog } from "@/types";
import { EMOTION_LABELS, EMOTION_COLORS } from "@/types";
import { format, parseISO, isSameDay, addDays, subDays } from "date-fns";

const USER_ID = Number(import.meta.env.VITE_USER_ID) || 1;
const PAGE_SIZE = 10;

export default function EmotionHistory() {
  const [allLogs, setAllLogs] = useState<EmotionLog[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmotionLogs(USER_ID)
      .then(setAllLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dayLogs = useMemo(
    () => allLogs.filter((l) => isSameDay(parseISO(l.detectedAt), selectedDate)),
    [allLogs, selectedDate]
  );

  const emotionSet = useMemo(() => {
    const set = new Set<string>();
    dayLogs.forEach((l) => set.add(l.primaryEmotion.toLowerCase()));
    return Array.from(set);
  }, [dayLogs]);

  const timelineData = useMemo(() => {
    const hours: Record<string, Record<string, number>> = {};
    for (let h = 0; h < 24; h++) {
      hours[`${h}시`] = {};
    }
    dayLogs.forEach((l) => {
      const h = parseISO(l.detectedAt).getHours();
      const emotion = l.primaryEmotion.toLowerCase();
      const key = `${h}시`;
      hours[key][emotion] = (hours[key][emotion] || 0) + 1;
    });
    return Object.entries(hours).map(([hour, counts]) => ({ hour, ...counts }));
  }, [dayLogs]);

  const totalPages = Math.max(1, Math.ceil(dayLogs.length / PAGE_SIZE));
  const pagedLogs = dayLogs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSelectedDate((d) => subDays(d, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <input
          type="date"
          value={format(selectedDate, "yyyy-MM-dd")}
          onChange={(e) => setSelectedDate(new Date(e.target.value + "T00:00:00"))}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSelectedDate((d) => addDays(d, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          {dayLogs.length}건 감지
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">시간대별 감정 변화</CardTitle>
        </CardHeader>
        <CardContent>
          <EmotionTimeline data={timelineData} emotions={emotionSet} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">감정 로그</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>시간</TableHead>
                  <TableHead>감정</TableHead>
                  <TableHead>스트레스</TableHead>
                  <TableHead className="hidden sm:table-cell">발화 텍스트</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      해당 날짜에 감정 로그가 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedLogs.map((log) => (
                    <TableRow key={log.emotionLogId}>
                      <TableCell className="whitespace-nowrap">
                        {format(parseISO(log.detectedAt), "HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <span
                          className="inline-flex items-center gap-1.5 text-sm font-medium"
                        >
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                EMOTION_COLORS[log.primaryEmotion.toLowerCase()] ??
                                "#95A5A6",
                            }}
                          />
                          {EMOTION_LABELS[log.primaryEmotion.toLowerCase()] ??
                            log.primaryEmotion}
                        </span>
                      </TableCell>
                      <TableCell>{log.finalStressLevel}/10</TableCell>
                      <TableCell className="hidden sm:table-cell max-w-xs truncate">
                        {log.speechText ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                이전
              </Button>
              <span className="text-sm text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
