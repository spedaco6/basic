import "server-only";
import { HTTPError } from "../errors";
import { verifyAccessToken } from "../tokens";
import { ChecklistItem } from "../models/ChecklistItem";
import { IChecklistItem } from "@/components/checklist/Checklist";

const editableFields = ["title", "complete"];

// todo add validation to all routes

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

// Update ChecklistItem
export const updateChecklistItem = async (
  item: IChecklistItem,
  accessToken: string,
) => {
  if (!accessToken) throw new HTTPError("No token provided", 401);
  const verified = await verifyAccessToken(accessToken);
  if (!verified) throw new HTTPError("Invalid token", 401);

  const existingItem = await ChecklistItem.findById(item.id);
  if (!existingItem) throw new HTTPError("No checklist item found", 404);
  if (existingItem.creatorId !== verified.userId) throw new HTTPError("Unauthorized", 401);

  // Get editable data
  const editedItem: Record<string, any> = {};
  Object.entries(item)
    .filter(([key]) => editableFields.includes(key))
    .forEach(([key, val]) => editedItem[key] = val);

  
  Object.assign(existingItem, editedItem);
  console.log(existingItem); 
  await existingItem.save();
  return existingItem;
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