import client from "./client";
import type { ApiResponse, EmotionLog } from "@/types";

export async function getEmotionLogs(userId: number): Promise<EmotionLog[]> {
  const { data } = await client.get<ApiResponse<EmotionLog[]>>(
    `/api/emotion-logs/user/${userId}`
  );
  return data.data;
}

export async function getRecentEmotionLogs(
  userId: number,
  count = 10
): Promise<EmotionLog[]> {
  const { data } = await client.get<ApiResponse<EmotionLog[]>>(
    `/api/emotion-logs/user/${userId}/recent`,
    { params: { count } }
  );
  return data.data;
}
