import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RecommendationCard from "@/components/cards/RecommendationCard";
import { getInterventions } from "@/api/intervention";
import type { Intervention, InterventionRating } from "@/types";
import { format, parseISO } from "date-fns";

const USER_ID = Number(import.meta.env.VITE_USER_ID) || 1;

const RATING_LABELS: Record<InterventionRating, string> = {
  HELPFUL: "도움됨",
  NEUTRAL: "보통",
  UNNECESSARY: "불필요",
  ANNOYING: "불쾌",
};

const RATING_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  HELPFUL: "default",
  NEUTRAL: "secondary",
  UNNECESSARY: "outline",
  ANNOYING: "destructive",
};

export default function Interventions() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Intervention | null>(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    getInterventions(USER_ID, 50)
      .then(setInterventions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "ALL"
      ? interventions
      : interventions.filter((i) => i.interventionRating === filter);

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
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="평가 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            <SelectItem value="HELPFUL">도움됨</SelectItem>
            <SelectItem value="NEUTRAL">보통</SelectItem>
            <SelectItem value="UNNECESSARY">불필요</SelectItem>
            <SelectItem value="ANNOYING">불쾌</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length}건</span>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            개입 이력이 없습니다
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((iv) => (
            <Card
              key={iv.interventionId}
              className="cursor-pointer transition-colors hover:bg-accent/30"
              onClick={() => setSelected(iv)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {format(parseISO(iv.createdAt), "yyyy-MM-dd HH:mm")}
                    </span>
                    {iv.interventionRating && (
                      <Badge variant={RATING_VARIANTS[iv.interventionRating] ?? "secondary"}>
                        {RATING_LABELS[iv.interventionRating]}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      추천 {iv.recommendations.length}건
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {iv.agentMessage}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={selected !== null} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                개입 상세 —{" "}
                {format(parseISO(selected.createdAt), "yyyy-MM-dd HH:mm")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">유형</p>
                  <p className="font-medium">{selected.interventionType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">평가</p>
                  <p className="font-medium">
                    {selected.interventionRating
                      ? RATING_LABELS[selected.interventionRating]
                      : "미평가"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">AI 메시지</p>
                <p className="text-sm rounded-lg bg-muted p-3">
                  {selected.agentMessage}
                </p>
              </div>

              {selected.interventionFeedbackText && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">피드백</p>
                  <p className="text-sm">{selected.interventionFeedbackText}</p>
                </div>
              )}

              {selected.recommendations.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">추천 항목</p>
                  <div className="space-y-2">
                    {selected.recommendations.map((rec) => (
                      <RecommendationCard
                        key={rec.recommendationId}
                        rec={rec}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
