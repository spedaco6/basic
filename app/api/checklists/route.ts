import { IChecklistItem } from "@/components/checklist/Checklist";
import { FetchResponseData } from "@/hooks/useFetch";
import { createChecklistItem, deleteChecklistItem } from "@/lib/server/api/checklists";
import { getAllChecklistItems } from "@/lib/server/api/checklists";
import { HTTPError } from "@/lib/server/errors";
import { getTokenFromAuthHeader } from "@/lib/server/tokens";
import { NextResponse } from "next/server";

export interface ChecklistItemReponseData extends FetchResponseData {
  items?: IChecklistItem[],
  item?: IChecklistItem,
}

export async function GET(req: Request) {
  try {
    // get token from auth header
    const token = getTokenFromAuthHeader(req);

    // complete action
    const items = await getAllChecklistItems(token);

    // send response
    return NextResponse.json({ success: true, message: "Successfully fetched checklist items", items });
  
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    // get token from auth header
    const token = getTokenFromAuthHeader(req);

    // get body from request
    const body = await req.json();

    // complete action
    await new Promise(res => setTimeout(res, 2000));
    const item = await createChecklistItem(body, token);
    
    // send response
    return NextResponse.json({ 
      success: true, 
      message: "Successfully created checklist item",
      item, 
    }, { status: 201 });
  
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    // get token from auth header
    const token = getTokenFromAuthHeader(req);

    // complete action

    // send response
    return NextResponse.json({ 
      success: true, 
      message: "Successfully updated checklist item" 
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    // get token from auth header
    const token = getTokenFromAuthHeader(req);

    // get body
    const body = await req.json();

    await new Promise(res => setTimeout(res, 2000));

    // complete action
    await deleteChecklistItem(body.id, token);
    
    // send response
    return NextResponse.json({ 
      success: true, 
      message: "Successfully deleted checklist item" 
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    const status = err instanceof HTTPError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}