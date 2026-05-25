import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUser, updatePreferences } from "@/api/user";
import type { UserPreference } from "@/types";

import client from "@/api/client";
import type { ApiResponse } from "@/types";

const USER_ID = Number(import.meta.env.VITE_USER_ID) || 1;

const MUSIC_GENRES = ["POP", "ROCK", "JAZZ", "CLASSICAL", "HIPHOP", "R&B", "INDIE", "EDM", "KPOP"];
const BOOK_GENRES = ["소설", "에세이", "자기계발", "시", "심리학", "철학", "과학", "역사"];
const PLACE_TYPES = ["카페", "공원", "산책로", "도서관", "해변", "산", "미술관", "영화관"];

function TagSelect({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <Badge
            key={opt}
            variant={active ? "default" : "outline"}
            className="cursor-pointer select-none"
            onClick={() =>
              onChange(active ? selected.filter((s) => s !== opt) : [...selected, opt])
            }
          >
            {opt}
            {active && <X className="ml-1 h-3 w-3" />}
          </Badge>
        );
      })}
    </div>
  );
}

export default function Settings() {
  const [prefs, setPrefs] = useState<UserPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    Promise.all([
      getUser(USER_ID).catch(() => null),
      client
        .get<ApiResponse<UserPreference>>(`/api/users/${USER_ID}/preferences`)
        .then((r) => r.data.data)
        .catch(() => null),
    ]).then(([user, pref]) => {
      if (user) setNickname(user.nickname);
      if (pref) {
        setPrefs(pref);
      } else {
        setPrefs({
          preferenceId: 0,
          userId: USER_ID,
          preferredMusicGenres: [],
          preferredMovieGenres: [],
          preferredBookGenres: [],
          preferredPlaceTypes: [],
          ttsEnabled: true,
          cooldownMinutes: 30,
        });
      }
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    if (!prefs) return;
    setSaving(true);
    try {
      const updated = await updatePreferences(USER_ID, {
        preferredMusicGenres: prefs.preferredMusicGenres,
        preferredMovieGenres: prefs.preferredMovieGenres,
        preferredBookGenres: prefs.preferredBookGenres,
        preferredPlaceTypes: prefs.preferredPlaceTypes,
        ttsEnabled: prefs.ttsEnabled,
        cooldownMinutes: prefs.cooldownMinutes,
      });
      setPrefs(updated);
      setSaveMessage("설정이 저장되었습니다.");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setSaveMessage("저장에 실패했습니다. 다시 시도해주세요.");
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !prefs) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">사용자 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            <span className="text-muted-foreground">닉네임:</span>{" "}
            <span className="font-medium">{nickname}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">선호 음악 장르</CardTitle>
        </CardHeader>
        <CardContent>
          <TagSelect
            options={MUSIC_GENRES}
            selected={prefs.preferredMusicGenres}
            onChange={(v) => setPrefs({ ...prefs, preferredMusicGenres: v })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">선호 도서 장르</CardTitle>
        </CardHeader>
        <CardContent>
          <TagSelect
            options={BOOK_GENRES}
            selected={prefs.preferredBookGenres}
            onChange={(v) => setPrefs({ ...prefs, preferredBookGenres: v })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">선호 장소 유형</CardTitle>
        </CardHeader>
        <CardContent>
          <TagSelect
            options={PLACE_TYPES}
            selected={prefs.preferredPlaceTypes}
            onChange={(v) => setPrefs({ ...prefs, preferredPlaceTypes: v })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">기타 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="tts" className="text-sm">
              TTS (음성 안내) 활성화
            </Label>
            <Switch
              id="tts"
              checked={prefs.ttsEnabled}
              onCheckedChange={(v: boolean) => setPrefs({ ...prefs, ttsEnabled: v })}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">쿨다운 시간</Label>
              <span className="text-sm font-medium">{prefs.cooldownMinutes}분</span>
            </div>
            <Slider
              min={10}
              max={60}
              step={5}
              value={[prefs.cooldownMinutes]}
              onValueChange={(vals: number[]) => setPrefs({ ...prefs, cooldownMinutes: vals[0] })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10분</span>
              <span>60분</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        <Save className="mr-2 h-4 w-4" />
        {saving ? "저장 중..." : "설정 저장"}
      </Button>

      {saveMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={cn(
            "rounded-lg px-4 py-3 text-sm font-medium shadow-lg",
            saveMessage.includes("실패")
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary text-primary-foreground"
          )}>
            {saveMessage}
          </div>
        </div>
      )}
    </div>
  );
}
