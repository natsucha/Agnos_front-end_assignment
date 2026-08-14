import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agnos Candidate Assignment",
  description: "Real-time patient input and staff monitoring system"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}