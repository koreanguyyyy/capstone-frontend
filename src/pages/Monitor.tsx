import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ChatBubble from "@/components/chat/ChatBubble";
import { getRecentEmotionLogs } from "@/api/emotion";
import {
  getInterventions,
  submitInterventionFeedback,
} from "@/api/intervention";
import type { EmotionLog, Intervention, InterventionRating } from "@/types";
import { EMOTION_LABELS } from "@/types";
import { format } from "date-fns";
import { useTheme } from "@/hooks/useTheme";

const USER_ID = Number(import.meta.env.VITE_USER_ID) || 1;
const POLL_INTERVAL = 5000;
const MAX_BUBBLES = 20;

const EMOTION_EMOJI: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  fear: "😰",
  disgust: "🤢",
  surprise: "😲",
  neutral: "😐",
};

function stressColor(level: number): string {
  if (level <= 3) return "#22c55e";
  if (level <= 6) return "#eab308";
  if (level <= 8) return "#f97316";
  return "#ef4444";
}

interface ChatMessage {
  interventionId: number;
  message: string;
  timestamp: string;
  feedbackGiven: boolean;
}

export default function Monitor() {
  const { dark } = useTheme();
  const [latestLog, setLatestLog] = useState<EmotionLog | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const lastInterventionIdRef = useRef<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  // Initial load: fetch recent 3 interventions as history
  useEffect(() => {
    async function init() {
      try {
        const [logs, interventions] = await Promise.all([
          getRecentEmotionLogs(USER_ID, 1).catch(() => []),
          getInterventions(USER_ID, 3).catch(() => []),
        ]);

        if (logs.length > 0) setLatestLog(logs[0]);

        const history: ChatMessage[] = interventions
          .reverse()
          .map((iv: Intervention) => ({
            interventionId: iv.interventionId,
            message: iv.agentMessage,
            timestamp: iv.createdAt,
            feedbackGiven: iv.interventionRating !== null,
          }));

        setMessages(history);

        if (interventions.length > 0) {
          const newest = interventions[interventions.length - 1];
          lastInterventionIdRef.current = newest.interventionId;
        }

        setLastUpdate(new Date());
      } catch {
        showToast("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [showToast]);

  // Polling
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [logs, interventions] = await Promise.all([
          getRecentEmotionLogs(USER_ID, 1).catch(() => []),
          getInterventions(USER_ID, 1).catch(() => []),
        ]);

        if (logs.length > 0) setLatestLog(logs[0]);

        if (interventions.length > 0) {
          const latest = interventions[0];
          if (
            lastInterventionIdRef.current !== null &&
            latest.interventionId !== lastInterventionIdRef.current
          ) {
            const newMsg: ChatMessage = {
              interventionId: latest.interventionId,
              message: latest.agentMessage,
              timestamp: latest.createdAt,
              feedbackGiven: false,
            };
            setMessages((prev) => [...prev.slice(-MAX_BUBBLES + 1), newMsg]);
          }
          lastInterventionIdRef.current = latest.interventionId;
        }

        setLastUpdate(new Date());
      } catch {
        // Silently fail on polling errors
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleFeedback(
    interventionId: number,
    rating: InterventionRating
  ) {
    try {
      await submitInterventionFeedback(interventionId, rating);
      setMessages((prev) =>
        prev.map((m) =>
          m.interventionId === interventionId
            ? { ...m, feedbackGiven: true }
            : m
        )
      );
      showToast("피드백이 전송되었습니다 😊");
    } catch {
      showToast("피드백 전송에 실패했습니다.");
    }
  }

  const emotion = latestLog?.primaryEmotion?.toLowerCase() ?? "";
  const stressLevel = latestLog?.finalStressLevel ?? 0;

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-24 rounded-lg bg-muted" />
        <div className="flex-1 space-y-4">
          <div className="h-16 w-3/4 rounded-lg bg-muted" />
          <div className="h-16 w-2/3 rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] gap-4">
      {/* Status Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">감지된 표정</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {EMOTION_EMOJI[emotion] ?? "❓"}
                </span>
                <span className="font-medium text-sm">
                  {EMOTION_LABELS[emotion] ?? "대기 중"}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">스트레스 수준</p>
              <div className="flex items-center gap-2">
                <Progress
                  value={stressLevel * 10}
                  className="flex-1 h-3"
                  style={
                    {
                      "--progress-foreground": stressColor(stressLevel),
                    } as React.CSSProperties
                  }
                />
                <span className="text-sm font-bold w-8 text-right">
                  {stressLevel}/10
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">최근 발화</p>
              <p className="text-sm truncate font-medium">
                {latestLog?.speechText ?? "-"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">마지막 업데이트</p>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-sm font-medium">
                  {lastUpdate ? format(lastUpdate, "HH:mm:ss") : "-"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <span className="text-4xl">🤖</span>
              <p className="text-sm">AI 추천이 도착하면 여기에 표시됩니다</p>
              <Badge variant="outline" className="text-xs">
                5초마다 자동 업데이트
              </Badge>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatBubble
                key={msg.interventionId}
                message={msg.message}
                timestamp={msg.timestamp}
                interventionId={msg.interventionId}
                onFeedback={handleFeedback}
                feedbackGiven={msg.feedbackGiven}
                darkMode={dark}
              />
            ))
          )}
          <div ref={chatEndRef} />
        </CardContent>
      </Card>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="rounded-lg bg-primary text-primary-foreground px-4 py-3 text-sm font-medium shadow-lg">
            {toastMsg}
          </div>
        </div>
      )}
    </div>
  );
}
