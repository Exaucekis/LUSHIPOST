import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminProviders } from "@/components/admin/AdminProviders";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/connexion?mode=staff&callbackUrl=/admin");
  }

  return (
    <AdminProviders>
      <div className="min-h-screen bg-[#edf0f5]">
        <AdminSidebar />
        <div className="md:pl-64">
          <main className="min-h-screen p-3 sm:p-5 lg:p-7">
            <div className="lp-admin-page">{children}</div>
          </main>
        </div>
      </div>
    </AdminProviders>
  );
}
