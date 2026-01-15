import React from "react";
import { Metadata } from "next";
import { DiagnosticToolbar } from "@/components/tools/DiagnosticToolbar";

export const metadata: Metadata = {
  title: "Diagnostics",
};

export default function DiagnosticsPage(): React.ReactElement {
  return <main className="p-4">
    <h1 className="text-2xl mb-4">DIAGNOSTICS</h1>
    <DiagnosticToolbar />
  </main>
}