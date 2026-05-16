import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import lucaLogo from "@/assets/luca-logo.png";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — LUCA" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

const credSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already signed in & admin, jump straight to dashboard
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active || !data.session) return;
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (active && role) navigate({ to: "/admin/dashboard" });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = credSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in");
    navigate({ to: "/admin/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F6F1] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={lucaLogo} alt="LUCA" className="h-12 w-auto mx-auto mb-4" />
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A2F23] text-[#D4AF37] rounded-full text-[10px] uppercase tracking-[0.2em]">
            <ShieldCheck className="size-3" /> Admin Access
          </div>
          <h1 className="text-2xl font-bold text-[#1A2F23] mt-4">Sign in to LUCA Admin</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Manage products, orders, and storefront content.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white border border-[#E8E4DF] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4"
        >
          <div>
            <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] font-medium block mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#E8E4DF] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2F23] min-h-[44px]"
              placeholder="you@luca.in"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest text-[#6B6B6B] font-medium block mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#E8E4DF] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2F23] min-h-[44px]"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#1A2F23] hover:bg-[#2E5041] disabled:opacity-60 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Sign in
          </button>
          <p className="text-[11px] text-[#9E9E9E] text-center mt-2">
            Need an account?{" "}
            <Link to="/auth/register" className="text-[#1A2F23] underline">
              Register
            </Link>{" "}
            then ask an existing admin to grant you access.
          </p>
        </form>
      </div>
    </div>
  );
}
