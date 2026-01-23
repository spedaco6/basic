import React from "react";
import { Metadata } from "next";
import { DiagnosticToolbar } from "@/components/tools/DiagnosticToolbar";
import { SetupToolbar } from "@/components/tools/SetupToolbar";
import { Button } from "@/components/buttons/Button";

export const metadata: Metadata = {
  title: "Diagnostics",
};

export default function DiagnosticsPage(): React.ReactElement {
  return <main className="p-4">
    <h1 className="text-2xl mb-4 uppercase">Setup</h1>
    <SetupToolbar />
    <h1 className="text-2xl mt-8 mb-4 uppercase">Testing</h1>
    <DiagnosticToolbar />
    <h1 className="text-2xl mt-8 mb-4 uppercase">Styling</h1>
    <div className="flex gap-2 flex-wrap">
      <Button>Default</Button>
      <Button type="secondary">Outline</Button>
      <Button type="outline">Secondary</Button>
      <Button type="flat">Flat</Button>
      <Button type="danger">Danger</Button>
      <Button type="secondaryDanger">Secondary Danger</Button>
      <Button type="outlineDanger">Outline Danger</Button>
      <Button type="flatDanger">Flat Danger</Button>
      <Button type="accept">Accept</Button>
      <Button type="secondaryAccept">Secondary Accept</Button>
      <Button type="outlineAccept">Outline Accept</Button>
      <Button type="flatAccept">Flat Accept</Button>
    </div>
  </main>
}