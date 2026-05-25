import client from "./client";
import type { ApiResponse, UserInfo, UserPreference } from "@/types";

export async function getUser(userId: number): Promise<UserInfo> {
  const { data } = await client.get<ApiResponse<UserInfo>>(
    `/api/users/${userId}`
  );
  return data.data;
}

export async function updatePreferences(
  userId: number,
  prefs: Partial<UserPreference>
): Promise<UserPreference> {
  const { data } = await client.put<ApiResponse<UserPreference>>(
    `/api/users/${userId}/preferences`,
    prefs
  );
  return data.data;
}
