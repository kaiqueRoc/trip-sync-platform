import { auth } from "@/auth";
import { PortfolioLanding } from "@/components/portfolio-landing";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }
  return <PortfolioLanding />;
}
