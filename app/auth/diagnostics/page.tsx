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
      <Button btnStyle="secondary">Secondary</Button>
      <Button btnStyle="outline">Outline</Button>
      <Button btnStyle="flat">Flat</Button>
      <Button btnStyle="danger">Danger</Button>
      <Button btnStyle="secondaryDanger">Secondary Danger</Button>
      <Button btnStyle="outlineDanger">Outline Danger</Button>
      <Button btnStyle="flatDanger">Flat Danger</Button>
      <Button btnStyle="accept">Accept</Button>
      <Button btnStyle="secondaryAccept">Secondary Accept</Button>
      <Button btnStyle="outlineAccept">Outline Accept</Button>
      <Button btnStyle="flatAccept">Flat Accept</Button>
    </div>
  </main>
}