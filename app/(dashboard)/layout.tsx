import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ShellClient from "@/components/layout/ShellClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return <ShellClient user={session}>{children}</ShellClient>;
}
