import { Checklist } from "@/components/checklist/Checklist";

export default async function ChecklistsPage() {

return <main className="p-4">
    <h1 className="text-2xl mb-4 uppercase">My To-Do List</h1> 
    <Checklist />
  </main>
}