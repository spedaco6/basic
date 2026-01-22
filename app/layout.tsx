import { config } from "dotenv";
import type { Metadata } from "next";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import { Alerts } from "@/components/alert/Alerts";
import { AlertContextProvider } from "@/context/AlertContext";

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
        <div id="modal"></div>
        <AlertContextProvider>
          {children}
          <Alerts />
        </AlertContextProvider>
      </body>
    </html>
  );
}
