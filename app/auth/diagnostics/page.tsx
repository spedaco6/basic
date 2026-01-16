import React from "react";
import { Metadata } from "next";
import { DiagnosticToolbar } from "@/components/tools/DiagnosticToolbar";
import { Alert } from "@/components/alert/Alert";

export const metadata: Metadata = {
  title: "Diagnostics",
};

export default function DiagnosticsPage(): React.ReactElement {
  return <main className="p-4">
    <h1 className="text-2xl mb-4 uppercase">Diagnostics</h1>
    <DiagnosticToolbar />
    <Alert />
  </main>
}