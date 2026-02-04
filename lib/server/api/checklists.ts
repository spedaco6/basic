import "server-only";
import { HTTPError } from "../errors";
import { verifyAccessToken } from "../tokens";
import { ChecklistItem } from "../models/ChecklistItem";
import { IChecklistItem } from "@/components/checklist/Checklist";

export const getAllChecklistItems = async (accessToken: string) => {
  if (!accessToken) throw new HTTPError("No token provided", 401);
  const verified = await verifyAccessToken(accessToken);
  if (!verified) throw new HTTPError("Invalid token", 401);
  
  // Find all checklist items
  const list = ChecklistItem.find({ creatorId: verified.userId });
  return list;
}

export const createChecklistItem = async (
  item: IChecklistItem, 
  accessToken: string
) => {
  if (!accessToken) throw new HTTPError("No token provided", 401);
  const verified = await verifyAccessToken(accessToken);
  if (!verified) throw new HTTPError("Invalid token", 401);

  const newItem = new ChecklistItem({
    title: item.title ?? "",
    complete: item.complete,
    creatorId: verified.userId,
  });
  await newItem.save();
  return newItem;
}

export const deleteChecklistItem = async (
  id: number, 
  accessToken: string
) => {
  if (!accessToken) throw new HTTPError("No token provided", 401);
  const verified = await verifyAccessToken(accessToken);
  if (!verified) throw new HTTPError("Invalid token", 401);
  
  const item = await ChecklistItem.findById(id);
  if (!item) throw new HTTPError("No checklist item found", 404);
  if (item.creatorId !== verified.userId) throw new HTTPError("Unauthorized", 401);

  await item.delete();
}