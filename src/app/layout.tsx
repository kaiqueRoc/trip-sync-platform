import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TripSync Platform",
  description: "Multi-tenant booking management for travel agencies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
