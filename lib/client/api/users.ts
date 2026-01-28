import { getToken } from "../tokens"

export const getUsers = async () => {
  const token = await getToken();
  return fetch("/api/profile/role", {
    headers: {
      "Authorization": "Bearer " + token,
    },
  });
}