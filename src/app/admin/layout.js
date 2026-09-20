import AdminGuard from "@/components/admin/AdminGuard";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-paper">
        <AdminNav />
        <main>{children}</main>
      </div>
    </AdminGuard>
  );
}
