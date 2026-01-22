import React from "react";
import { Metadata } from "next";
import { DiagnosticToolbar } from "@/components/tools/DiagnosticToolbar";
import { SetupToolbar } from "@/components/tools/SetupToolbar";

export const metadata: Metadata = {
  title: "Diagnostics",
};

export default function DiagnosticsPage(): React.ReactElement {
  return <main className="p-4">
    <h1 className="text-2xl mb-4 uppercase">Setup</h1>
    <SetupToolbar />
    <h1 className="text-2xl mt-8 mb-4 uppercase">Testing</h1>
    <DiagnosticToolbar />
  </main>
}