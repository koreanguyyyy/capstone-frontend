import client from "./client";
import type { ApiResponse, Intervention, InterventionRating } from "@/types";

export async function getInterventions(
  userId: number,
  size = 10
): Promise<Intervention[]> {
  const { data } = await client.get<ApiResponse<Intervention[]>>(
    `/api/interventions/user/${userId}`,
    { params: { size } }
  );
  return data.data;
}

export async function submitInterventionFeedback(
  interventionId: number,
  interventionRating: InterventionRating
): Promise<Intervention> {
  const { data } = await client.post<ApiResponse<Intervention>>(
    `/api/interventions/${interventionId}/feedback`,
    { interventionRating }
  );
  return data.data;
}
