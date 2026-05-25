import client from "./client";
import type { ApiResponse, Intervention } from "@/types";

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
