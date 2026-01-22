import { ProfileData } from "@/lib/server/api/profile";
import { getToken } from "../tokens";


export const getProfile = async (): Promise<Response> => {
  const token = await getToken();
  return fetch("/api/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
}

export const putProfile = async (profile: Partial<ProfileData>) => {
  const token = await getToken();
  return fetch("/api/profile", {
    method: "put",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(profile),
  })
}