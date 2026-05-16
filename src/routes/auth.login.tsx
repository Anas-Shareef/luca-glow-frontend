import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Sign in | Luca Cosmetics" },
      { name: "description", content: "Sign in to your Luca account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return <AuthShell mode="login" />;
}

export function AuthShell({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin 
        ? { email: form.email, password: form.password }
        : {
            name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
            password_confirmation: form.password_confirmation,
          };

      const { data } = await api.post(endpoint, payload);
      
      localStorage.setItem("luca_token", data.token);
      localStorage.setItem("luca_user", JSON.stringify(data.user));
      
      toast.success(isLogin ? "Welcome back!" : "Account created successfully!");
      
      // Small delay to ensure storage is set
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Authentication failed";
      toast.error(msg);
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).flat().forEach((err: any) => toast.error(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-cream p-8 rounded-lg shadow-sm">
        <h1 className="font-display text-3xl font-bold text-center mb-2">
          {isLogin ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {isLogin ? "Sign in to your Luca account" : "Join the Luca family"}
        </p>
        <form className="space-y-4" onSubmit={handleAuth}>
          {!isLogin && (
            <>
              <input
                required
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-background border rounded-md px-3 py-2.5 text-sm outline-rose"
              />
              <input
                required
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-background border rounded-md px-3 py-2.5 text-sm outline-rose"
              />
            </>
          )}
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-background border rounded-md px-3 py-2.5 text-sm outline-rose"
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-background border rounded-md px-3 py-2.5 text-sm outline-rose"
          />
          {!isLogin && (
            <input
              required
              type="password"
              placeholder="Confirm Password"
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
              className="w-full bg-background border rounded-md px-3 py-2.5 text-sm outline-rose"
            />
          )}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          {isLogin ? (
            <>
              No account?{" "}
              <Link to="/auth/register" className="text-rose underline font-medium">
                Create one
              </Link>
            </>
          ) : (
            <>
              Already a member?{" "}
              <Link to="/auth/login" className="text-rose underline font-medium">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
