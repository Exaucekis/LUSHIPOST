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
      <div className="min-h-screen min-w-0 bg-[#edf0f5]">
        <AdminSidebar />
        <div className="min-w-0 md:pl-56 lg:pl-64">
          <main className="min-h-screen p-3 sm:p-5 lg:p-7">
            <div className="lp-admin-page">{children}</div>
          </main>
        </div>
      </div>
    </AdminProviders>
  );
}
