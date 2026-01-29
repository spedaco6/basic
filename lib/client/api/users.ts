import { getToken } from "../tokens"

export const getUsers = async () => {
  const token = await getToken();
  return fetch("/api/profile/permissions", {
    headers: {
      "Authorization": "Bearer " + token,
    },
  });
}