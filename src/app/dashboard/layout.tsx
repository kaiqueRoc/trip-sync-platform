import { auth } from "@/auth";
import { DashboardNav } from "@/components/dashboard-nav";
import { SignOutButton } from "@/components/sign-out-button";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { name: true, slug: true },
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-5 shadow-sm lg:flex lg:flex-col">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white">
            TS
          </div>
          <div>
            <p className="text-base font-bold text-slate-950">TripSync</p>
            <p className="text-xs text-slate-500">Platform</p>
          </div>
        </div>
        <DashboardNav />
        <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Agência atual
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {org?.name ?? "Organização"}
          </p>
          <p className="mt-1 text-xs text-slate-500">{org?.slug ?? "workspace"}</p>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
          <div>
            <p className="text-sm font-semibold text-slate-900 lg:hidden">TripSync</p>
            <p className="text-xs text-slate-500">Multi-tenant booking platform</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{session.user.email}</p>
              <p className="text-xs text-slate-500">{session.role}</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
              {(session.user.name ?? session.user.email ?? "AD")
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
