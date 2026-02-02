import { Checklist } from "@/components/checklist/Checklist";

export default async function ChecklistsPage() {

return <main className="p-4">
    <h1 className="text-2xl mb-4 uppercase">My To-Do List</h1> 
    <ul>
      <s><li>Style buttons</li></s>
      <s><li>Allow for account deletion</li></s>
      <s><li>Reset passwords</li></s>
      <s><li>Allow for users to be added</li></s>
      <li>Remove promises in api routes</li>
      <li>Improve optimistic updates</li>
      <li>Improve GetList context and refresh</li>
      <li>Simple checklist list functionality</li>
      <li>Style Input and Select elements for disabled state</li>
      <li>Style disabled buttons</li>
      <li>Create tests</li>
      <li>Extract components where possible</li>
    </ul>
    <Checklist />
  </main>
}