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
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white p-4">
        <div className="mb-6">
          <p className="text-lg font-bold text-brand-900">TripSync</p>
          <p className="text-xs text-slate-500">{org?.name ?? "Organização"}</p>
          <span className="mt-2 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
            {session.role}
          </span>
        </div>
        <DashboardNav />
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <p className="text-sm text-slate-600">{session.user.email}</p>
          <SignOutButton />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
