import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "./auth.login";

export const Route = createFileRoute("/auth/register")({
  head: () => ({
    meta: [
      { title: "Create account | Luca Cosmetics" },
      { name: "description", content: "Join Luca for clean, cruelty-free beauty." },
    ],
  }),
  component: () => <AuthShell mode="register" />,
});
