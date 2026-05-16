import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Loader2, ShieldOff } from "lucide-react";

/** Wraps admin pages: redirects to /admin/login if no session, blocks if not admin. */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { loading, session, isAdmin } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F6F1]">
        <Loader2 className="size-8 text-[#1A2F23] animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F6F1] px-6">
        <div className="max-w-md text-center bg-white rounded-2xl border border-[#E8E4DF] p-8 shadow-sm">
          <div className="mx-auto mb-4 size-14 rounded-full bg-[#C0392B]/10 flex items-center justify-center">
            <ShieldOff className="size-7 text-[#C0392B]" />
          </div>
          <h1 className="text-xl font-bold text-[#1A2F23]">Admin access required</h1>
          <p className="mt-2 text-sm text-[#6B6B6B]">
            Your account doesn't have admin permissions. Contact a site administrator to request
            access.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#1A2F23] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2E5041] transition-colors min-h-[44px]"
          >
            Back to storefront
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
