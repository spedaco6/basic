import "server-only";
import { HTTPError } from "../errors";
import { verifyAccessToken } from "../tokens";
import { ChecklistItem } from "../models/ChecklistItem";
import { FetchResponseData } from "@/hooks/useFetch";

export const getAllChecklistItems = async (accessToken: string) => {
  if (!accessToken) throw new HTTPError("No token provided", 401);
  const verified = await verifyAccessToken(accessToken);
  if (!verified) throw new HTTPError("Invalid token", 401);

  // Find all checklist items
  const list = ChecklistItem.find({ creatorId: verified.userId });
  return list;
}