import { IChecklistItem } from "@/components/checklist/Checklist";
import { getToken } from "../tokens"

export const getAllChecklistItems = async () => {
  const token = await getToken();
  return fetch("/api/checklists", {
    headers: {
      "Authorization": "Bearer " + token,
    }
  });
}

export const createChecklistItem = async (payload: Partial<IChecklistItem>) => {
  const token = await getToken();
  return fetch("/api/checklists", {
    method: "post",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload)
  });
}

export const updateChecklistItem = async (payload: Partial<IChecklistItem>) => {
  const token = await getToken();
  return fetch("/api/checklists", {
    method: "put",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload)
  });
}

export const deleteChecklistItem = async (id?: number) => {
  const token = await getToken();
  return fetch("/api/checklists", {
    method: "delete",
    headers: {
      "Authorization": "Bearer " + token,
    },
    body: JSON.stringify({ id })
  });
}