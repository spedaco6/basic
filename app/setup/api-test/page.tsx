import { HTTPError } from "@/lib/server/errors";

export default async function TestApiPage() {
  let message = "";
  try {
    const response = await fetch("/api/test");
    if (!response.ok) throw new HTTPError("The response was not ok");
    const result = await response.json();
    message = result.message;
  } catch (err) {
    message = err instanceof HTTPError ? err.message : "An error occurred";
  }

  return <div className="p-2">
    <p>{ message }</p>
  </div>
}