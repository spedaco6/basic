import { getToken } from "../tokens"

export const getAllChecklistItems = async () => {
  const token = await getToken();
  return fetch("/api/checklists", {
    headers: {
      "Authorization": "Bearer " + token,
    }
  });
}