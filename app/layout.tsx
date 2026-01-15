import type { Metadata } from "next";
import "./globals.css";

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
      </body>
    </html>
  );
}
