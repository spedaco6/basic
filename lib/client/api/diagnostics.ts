import { getToken } from "../tokens";

export const createTestUsers = async () => {
  const token = await getToken();
  return fetch("/api/diagnostics/setup-users", {
    method: "post",
    headers: {
      "Authorization": "Bearer " + token,
    }
  });
};
export const deleteTestUsers = async () => {
  const token = await getToken();
  return fetch("/api/diagnostics/setup-users", {
    method: "delete",
    headers: {
      "Authorization": "Bearer " + token,
    }
  });
};