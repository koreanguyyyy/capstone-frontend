import client from "./client";
import type { ApiResponse, Recommendation } from "@/types";

export async function getRecommendationsByIntervention(
  interventionId: number
): Promise<Recommendation[]> {
  const { data } = await client.get<ApiResponse<Recommendation[]>>(
    `/api/recommendations/intervention/${interventionId}`
  );
  return data.data;
}

export async function getRecentRecommendations(
  userId: number,
  size = 5
): Promise<Recommendation[]> {
  const { data } = await client.get<ApiResponse<Recommendation[]>>(
    `/api/recommendations/user/${userId}/recent`,
    { params: { size } }
  );
  return data.data;
}
