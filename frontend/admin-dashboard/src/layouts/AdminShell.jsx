import { useAdminAuth } from "@/features/auth/context/AdminAuthContext";

export default function AdminShell({ children }) {
  const { admin, logout } = useAdminAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <span className="eyebrow">Admin Dashboard</span>
          <h2>Audit Command Center</h2>
          <p className="sidebar-copy">
            Read-only system ledger for certificate requests, auth activity, and
            review state transitions.
          </p>
        </div>

        <div className="admin-identity">
          <p>{admin?.name || "Admin"}</p>
          <span>{admin?.email}</span>
          <small>{admin?.role || "admin"}</small>
        </div>

        <button className="secondary-button" type="button" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="admin-content">{children}</main>
    </div>
  );
}
