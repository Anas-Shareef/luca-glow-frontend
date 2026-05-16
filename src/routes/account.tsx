import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/shop/ConfirmDialog";
import { api } from "@/lib/api";
import {
  User,
  Package,
  MapPin,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  Plus,
  Pencil,
  Trash2,
  Star,
  Truck,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account · Dashboard | LUCA" },
      {
        name: "description",
        content:
          "Manage your LUCA profile, orders, addresses and security settings in one place.",
      },
      { property: "og:title", content: "My Account · Dashboard | LUCA" },
      { property: "og:description", content: "Manage your LUCA account." },
    ],
  }),
  component: AccountPage,
});

type TabId = "profile" | "orders" | "addresses" | "security";

const NAV: { id: TabId; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "security", label: "Security", icon: Lock },
];

// Order types will be fetched from API now
type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
type Order = {
  id: string;
  order_number: string;
  date: string;
  status: OrderStatus;
  refund_status: string | null;
  total: number;
  address: string;
  items: { name: string; qty: number; price: number }[];
};

type Address = {
  id: string;
  fullName: string;
  street: string;
  apt?: string;
  city: string;
  state: string;
  zip: string;
  country: "India" | "UAE";
  phone: string;
  isDefault: boolean;
};

const authHeader = () => {
  if (typeof window === 'undefined') return {};
  return { Authorization: `Bearer ${localStorage.getItem('luca_token')}` };
};

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name required").max(50),
  lastName: z.string().trim().min(1, "Last name required").max(50),
  phone: z.string().trim().min(7, "Enter a valid phone").max(20),
});

const passwordSchema = z
  .object({
    current: z.string().min(1, "Current password required"),
    next: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

const addressSchema = z.object({
  fullName: z.string().trim().min(1).max(80),
  street: z.string().trim().min(1).max(120),
  apt: z.string().trim().max(60).optional(),
  city: z.string().trim().min(1).max(60),
  state: z.string().trim().min(1).max(60),
  zip: z.string().trim().min(3).max(10),
  country: z.enum(["India", "UAE"]),
  phone: z.string().trim().min(7).max(20),
  isDefault: z.boolean(),
});

const statusVariant: Record<string, string> = {
  Pending:    "bg-amber-100 text-amber-900 border-amber-200",
  Processing: "bg-orange-100 text-orange-900 border-orange-200",
  Shipped:    "bg-blue-100 text-blue-900 border-blue-200",
  Delivered:  "bg-emerald-100 text-emerald-900 border-emerald-200",
  Cancelled:  "bg-rose-100 text-rose-900 border-rose-200",
};

function AccountPage() {
  const [tab, setTab] = useState<TabId>("profile");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/storefront/me', { headers: authHeader() });
      return data;
    }
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const { data } = await api.get('/storefront/orders', { headers: authHeader() });
      return data;
    }
  });

  const { data: addresses = [], refetch: refetchAddresses } = useQuery({
    queryKey: ['my-addresses'],
    queryFn: async () => {
      const { data } = await api.get('/storefront/addresses', { headers: authHeader() });
      return data as Address[];
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('luca_token'),
  });

  const handleLogout = () => {
    localStorage.removeItem("luca_token");
    localStorage.removeItem("luca_user");
    qc.clear();
    window.location.href = "/";
  };

  if (loadingUser) return <div className="min-h-[60vh] flex items-center justify-center">Loading your account...</div>;
  if (!user) {
    navigate({ to: '/auth/login' });
    return null;
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">My Account</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Manage your profile, orders, addresses and security.
        </p>
      </div>

      {/* Mobile/Tablet tab bar — scrollable pills */}
      <div className="md:hidden mb-6 -mx-4 px-4 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 min-w-max pb-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm whitespace-nowrap border transition-colors min-h-[44px]",
                tab === n.id
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border hover:bg-muted",
              )}
            >
              <n.icon className="size-4" />
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] lg:grid-cols-[250px_1fr] gap-6 md:gap-8 lg:gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden md:block">
          <Card>
            <CardContent className="p-3">
              <nav className="space-y-1">
                {NAV.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setTab(n.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-left transition-colors",
                      tab === n.id
                        ? "bg-foreground text-background"
                        : "hover:bg-muted text-foreground",
                    )}
                  >
                    <n.icon className="size-4" /> {n.label}
                  </button>
                ))}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-muted text-muted-foreground"
                  >
                    <LogOut className="size-4" /> Sign out
                  </button>
              </nav>
            </CardContent>
          </Card>
        </aside>

        <div className="min-w-0">
          {tab === "profile" && <ProfileTab user={user} orders={orders} addresses={addresses} />}
          {tab === "orders" && <OrdersTab orders={orders} />}
          {tab === "addresses" && (
            <AddressesTab addresses={addresses} refetch={refetchAddresses} />
          )}
          {tab === "security" && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Profile ---------------- */

function ProfileTab({ user, orders, addresses }: { user: any, orders: Order[]; addresses: Address[] }) {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const qc = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: (data: any) => api.put('/storefront/profile', data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('luca_token')}` }
    }),
    onSuccess: (res) => {
      qc.setQueryData(['me'], res.data);
      toast.success("Profile updated");
    }
  });

  const active = orders.filter((o) => o.status === "Shipped" || o.status === "Pending").length;

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ name, phone });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <Card className="bg-gradient-to-br from-cream to-background border-cream">
        <CardContent className="p-4 sm:p-6">
          <h2 className="font-display text-xl sm:text-2xl font-bold">Hello, {name.split(' ')[0]}!</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome to your LUCA dashboard.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Total Orders" value={orders.length.toString()} icon={Package} />
        <StatCard
          label="Active Orders"
          value={`${active} In Transit`}
          icon={Truck}
        />
        <StatCard label="Saved Addresses" value={addresses.length.toString()} icon={MapPin} />
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <CardDescription>Update your details to keep them current.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <form onSubmit={onSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email} disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" className="w-full sm:w-auto">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Package;
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="font-display text-lg sm:text-2xl font-bold mt-1 truncate">{value}</p>
        </div>
        <div className="size-9 sm:size-10 rounded-full bg-muted flex items-center justify-center shrink-0">
          <Icon className="size-4 sm:size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------- Orders ---------------- */


function OrdersTab({ orders }: { orders: Order[] }) {
  const [open, setOpen] = useState<Order | null>(null);
  const qc = useQueryClient();

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg">Order History</CardTitle>
        <CardDescription>Track your active orders and view past purchases.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        {orders.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            <Package className="size-8 mx-auto mb-3 opacity-30" />
            <p>No orders yet.</p>
            <p className="mt-1 text-xs">Your purchases will appear here.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">#{o.order_number}</TableCell>
                      <TableCell className="text-muted-foreground">{o.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("border w-fit", statusVariant[o.status])}>
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{o.total.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setOpen(o)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {orders.map((o) => (
                <Card key={o.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">#{o.order_number}</p>
                      <Badge variant="outline" className={cn("border text-[10px]", statusVariant[o.status])}>
                        {o.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{o.date}</p>
                    </div>
                    <p className="font-display font-bold">₹{o.total.toLocaleString("en-IN")}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 min-h-[44px]" onClick={() => setOpen(o)}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>

      {/* Order detail sheet */}
      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle>Order #{open.order_number}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={cn("border", statusVariant[open.status])}>
                    {open.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Items</p>
                  <ul className="space-y-2">
                    {open.items.map((it) => (
                      <li key={it.name} className="flex justify-between text-sm">
                        <span className="min-w-0 truncate mr-2">{it.name} × {it.qty}</span>
                        <span className="font-medium shrink-0">₹{(it.price * it.qty).toLocaleString("en-IN")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-3 border-t flex justify-between font-display font-bold">
                  <span>Total</span>
                  <span>₹{open.total.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Shipping Address</p>
                  <p className="text-sm">{open.address}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Tracking</p>
                  <Timeline status={open.status} />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

    </Card>
  );
}

function Timeline({ status }: { status: OrderStatus }) {
  const steps = ["Pending", "Processing", "Shipped", "Delivered"] as const;
  const idx = status === "Cancelled" ? -1 : steps.indexOf(status as (typeof steps)[number]);
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-3 text-sm">
          <CheckCircle2
            className={cn(
              "size-4",
              i <= idx ? "text-emerald-600" : "text-muted-foreground/40",
            )}
          />
          <span className={cn(i <= idx ? "text-foreground" : "text-muted-foreground")}>{s}</span>
        </li>
      ))}
    </ol>
  );
}


/* ---------------- Addresses ---------------- */

function AddressesTab({
  addresses,
  refetch,
}: {
  addresses: Address[];
  refetch: () => void;
}) {
  const [editing, setEditing] = useState<Address | null>(null);
  const [confirmDeleteAddress, setConfirmDeleteAddress] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const deleteMut = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/storefront/addresses/${id}`, { headers: authHeader() }),
    onSuccess: () => { refetch(); toast.success("Address deleted"); },
    onError: () => toast.error("Could not delete address"),
  });

  const defaultMut = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/storefront/addresses/${id}/default`, {}, { headers: authHeader() }),
    onSuccess: () => { refetch(); toast.success("Default address updated"); },
    onError: () => toast.error("Could not update default"),
  });

  const saveMut = useMutation({
    mutationFn: (data: Omit<Address, "id"> & { id?: string }) => {
      if (data.id) {
        return api.put(`/storefront/addresses/${data.id}`, data, { headers: authHeader() });
      }
      return api.post('/storefront/addresses', data, { headers: authHeader() });
    },
    onSuccess: () => {
      refetch();
      setOpen(false);
      setEditing(null);
      toast.success(editing ? "Address updated" : "Address added");
    },
    onError: () => toast.error("Could not save address"),
  });

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6 flex-col sm:flex-row items-start sm:items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-lg">Address Book</CardTitle>
          <CardDescription>Add your shipping addresses — your default one auto-fills at checkout.</CardDescription>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto min-h-[44px]">
              <Plus className="size-4 mr-1" /> Add New
            </Button>
          </DialogTrigger>
          <AddressDialog
            initial={editing}
            saving={saveMut.isPending}
            onSave={(data) => saveMut.mutate(data)}
          />
        </Dialog>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        {addresses.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            <MapPin className="size-8 mx-auto mb-3 opacity-30" />
            <p>No addresses saved yet.</p>
            <p className="mt-1 text-xs">Add one above — it will auto-fill at checkout.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <Card key={a.id} className="relative">
                <CardContent className="p-4 sm:p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm sm:text-base">{a.fullName}</p>
                    {a.isDefault && (
                      <Badge className="gap-1 shrink-0 text-[10px]">
                        <Star className="size-3" /> Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {a.street}
                    {a.apt ? `, ${a.apt}` : ""}
                    <br />
                    {a.city}, {a.state} {a.zip}
                    <br />
                    {a.country}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{a.phone}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="min-h-[40px] text-xs"
                      onClick={() => { setEditing(a); setOpen(true); }}
                    >
                      <Pencil className="size-3.5 mr-1" /> Edit
                    </Button>
                    {!a.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="min-h-[40px] text-xs"
                        disabled={defaultMut.isPending}
                        onClick={() => defaultMut.mutate(a.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="min-h-[40px] text-xs text-rose-500 hover:text-rose-600"
                      disabled={deleteMut.isPending}
                      onClick={() => setConfirmDeleteAddress(a.id)}
                    >
                      <Trash2 className="size-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


function AddressDialog({
  initial,
  onSave,
  saving = false,
}: {
  initial: Address | null;
  onSave: (data: Omit<Address, "id"> & { id?: string }) => void;
  saving?: boolean;
}) {
  const [form, setForm] = useState<Omit<Address, "id">>({
    fullName: initial?.fullName ?? "",
    street: initial?.street ?? "",
    apt: initial?.apt ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    zip: initial?.zip ?? "",
    country: initial?.country ?? "India",
    phone: initial?.phone ?? "",
    isDefault: initial?.isDefault ?? false,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addressSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    onSave({ ...result.data, id: initial?.id });
  };

  return (
    <DialogContent className="max-w-lg w-[92vw] sm:w-full max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{initial ? "Edit Address" : "Add New Address"}</DialogTitle>
        <DialogDescription>
          We use this for delivery and order updates only.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1.5">
          <Label>Full Name</Label>
          <Input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            maxLength={80}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Street Address</Label>
          <Input
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            maxLength={120}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Apt / Suite (optional)</Label>
          <Input
            value={form.apt ?? ""}
            onChange={(e) => setForm({ ...form, apt: e.target.value })}
            maxLength={60}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              maxLength={60}
            />
          </div>
          <div className="space-y-1.5">
            <Label>State</Label>
            <Input
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              maxLength={60}
            />
          </div>
          <div className="space-y-1.5">
            <Label>ZIP / PIN Code</Label>
            <Input
              value={form.zip}
              onChange={(e) => setForm({ ...form, zip: e.target.value })}
              maxLength={10}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Country</Label>
            <select
              value={form.country}
              onChange={(e) =>
                setForm({ ...form, country: e.target.value as "India" | "UAE" })
              }
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="India">India</option>
              <option value="UAE">UAE</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            maxLength={20}
          />
        </div>
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">Make this my default address</p>
            <p className="text-xs text-muted-foreground">Used at checkout by default</p>
          </div>
          <Switch
            checked={form.isDefault}
            onCheckedChange={(v) => setForm({ ...form, isDefault: v })}
          />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? "Saving..." : initial ? "Save Changes" : "Add Address"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

/* ---------------- Security ---------------- */

function SecurityTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState({ current: false, next: false, confirm: false });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = passwordSchema.safeParse({ current, next, confirm });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    toast.success("Password updated");
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  const fields = [
    { id: "current" as const, label: "Current Password", value: current, set: setCurrent },
    { id: "next" as const, label: "New Password", value: next, set: setNext },
    { id: "confirm" as const, label: "Confirm New Password", value: confirm, set: setConfirm },
  ];

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg">Account Security</CardTitle>
        <CardDescription>Update your password to keep your account safe.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <form onSubmit={submit} className="space-y-4 max-w-md">
          {fields.map((f) => (
            <div key={f.id} className="space-y-1.5">
              <Label htmlFor={f.id}>{f.label}</Label>
              <div className="relative">
                <Input
                  id={f.id}
                  type={show[f.id] ? "text" : "password"}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow({ ...show, [f.id]: !show[f.id] })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
                  aria-label="Toggle visibility"
                >
                  {show[f.id] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          ))}
          <Button type="submit" className="w-full sm:w-auto">Update Password</Button>
        </form>
      </CardContent>
    </Card>
  );
}
