import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-brand-900">TripSync</h1>
          <p className="mt-1 text-sm text-slate-500">Plataforma multi-tenant de reservas</p>
        </div>
        <Suspense fallback={<p className="text-sm text-slate-500">Carregando…</p>}>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-xs text-slate-400">
          Demo: owner@demo.tripsync / Demo@2025
        </p>
      </div>
    </main>
  );
}
