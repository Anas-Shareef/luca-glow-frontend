import { createFileRoute } from "@tanstack/react-router";
import {
  TrendingUp,
  ShoppingCart,
  IndianRupee,
  Users,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { formatINR } from "@/store/shop";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — LUCA Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <AdminGuard>
      <DashboardPage />
    </AdminGuard>
  ),
});

const kpis = [
  {
    label: "Total Revenue",
    value: formatINR(248500),
    delta: "+12.4% vs last 30d",
    icon: IndianRupee,
    trend: "up" as const,
  },
  {
    label: "Total Orders",
    value: "184",
    delta: "8 pending",
    icon: ShoppingCart,
    trend: "neutral" as const,
  },
  {
    label: "Avg. Order Value",
    value: formatINR(1350),
    delta: "+₹120 vs last 30d",
    icon: TrendingUp,
    trend: "up" as const,
  },
  {
    label: "Active Customers",
    value: "1,243",
    delta: "+34 this week",
    icon: Users,
    trend: "up" as const,
  },
];

function DashboardPage() {
  return (
    <AdminLayout title="Dashboard">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="bg-white border border-[#E8E4DF] rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <p className="text-[11px] uppercase tracking-widest text-[#6B6B6B] font-medium">
                  {k.label}
                </p>
                <div className="size-9 rounded-lg bg-[#1A2F23]/5 flex items-center justify-center">
                  <Icon className="size-4 text-[#1A2F23]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1A2F23] mt-3">{k.value}</p>
              <p className="text-xs text-[#3A6B52] mt-1 flex items-center gap-1">
                {k.trend === "up" && <ArrowUpRight className="size-3" />}
                {k.delta}
              </p>
            </div>
          );
        })}
      </div>

      {/* Two-column lower section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {/* Sales trend placeholder */}
        <div className="lg:col-span-2 bg-white border border-[#E8E4DF] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#1A2F23]">Sales Trend</h2>
              <p className="text-xs text-[#9E9E9E]">Last 30 days · INR</p>
            </div>
            <div className="flex gap-1 text-[11px] uppercase tracking-widest">
              {["Daily", "Weekly", "Monthly"].map((p, i) => (
                <button
                  key={p}
                  className={
                    i === 0
                      ? "bg-[#1A2F23] text-white px-3 py-1.5 rounded-md"
                      : "text-[#6B6B6B] px-3 py-1.5 rounded-md hover:bg-[#F9F6F1]"
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 rounded-xl bg-gradient-to-br from-[#F9F6F1] to-[#E8E4DF]/40 flex items-center justify-center text-sm text-[#9E9E9E]">
            Chart will appear once orders are recorded
          </div>
        </div>

        {/* Inventory alerts */}
        <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="size-4 text-[#E67E22]" />
            <h2 className="text-base font-semibold text-[#1A2F23]">Inventory Alerts</h2>
          </div>
          <p className="text-xs text-[#9E9E9E] mb-4">
            Products will appear here once stock falls below 10 units.
          </p>
          <div className="text-center py-10 text-sm text-[#9E9E9E]">
            ✓ All products well-stocked
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white border border-[#E8E4DF] rounded-2xl p-5 shadow-sm mt-6">
        <h2 className="text-base font-semibold text-[#1A2F23] mb-3">Recent Activity</h2>
        <div className="text-center py-10 text-sm text-[#9E9E9E]">
          New orders and customer signups will stream in here.
        </div>
      </div>
    </AdminLayout>
  );
}
