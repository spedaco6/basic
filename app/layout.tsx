import { config } from "dotenv";
import type { Metadata } from "next";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import { Alert } from "@/components/alert/Alert";

config();

export const metadata: Metadata = {
  title: "Basic App",
  description: "Created by spedaco",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Alert />
      </body>
    </html>
  );
}
