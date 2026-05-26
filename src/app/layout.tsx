import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TripSync — Portfólio",
  description:
    "Ecossistema TripSync: contratos OpenAPI, API Fastify, console ops e plataforma multi-tenant Next.js",
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
