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
      <div className="min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="md:pl-64">
          <main className="min-h-screen p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminProviders>
  );
}
