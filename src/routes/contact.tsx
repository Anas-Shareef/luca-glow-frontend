import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Phone, Mail, MessageCircle, Truck } from "lucide-react";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "919567903350";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | Luca × Lykha" },
      {
        name: "description",
        content:
          "Get in touch with Luca × Lykha. Shipping all over India and UAE — WhatsApp support available.",
      },
      { property: "og:title", content: "Contact Luca × Lykha" },
      { property: "og:description", content: "We'd love to hear from you." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thanks! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:py-20">
      {/* Shipping banner */}
      <div className="bg-cream border rounded-md p-3 flex items-center justify-center gap-2 text-xs uppercase tracking-widest mb-10">
        <Truck className="size-4 text-rose" />
        Shipping all over India and UAE
      </div>

      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-rose mb-2">Get In Touch</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-[0.15em]">
          Contact Us
        </h1>
        <p className="text-muted-foreground mt-3">We'd love to hear from you.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-4 p-5 border-2 border-emerald-500 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
          >
            <div className="size-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <MessageCircle className="size-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold mb-1">WhatsApp Official Luca Support</h3>
              <p className="text-sm text-muted-foreground">
                Tap to chat with us — fastest response.
              </p>
              <p className="text-sm font-medium mt-1">+91 95679 03350</p>
            </div>
          </a>

          <InfoCard
            icon={MapPin}
            title="Visit Us"
            lines={["Northern Sky Apartments, 1704,", "B Block, Pumpwell, Mangalore."]}
          />
          <InfoCard
            icon={Phone}
            title="Call Us"
            lines={["+91 95679 03350"]}
            href="tel:9567903350"
          />
          <InfoCard
            icon={Mail}
            title="Email"
            lines={["Support@lucasworld.in"]}
            href="mailto:Support@lucasworld.in"
          />
        </div>

        <form onSubmit={submit} className="bg-cream p-6 md:p-8 rounded-lg space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Message</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  lines,
  href,
}: {
  icon: React.ElementType;
  title: string;
  lines: string[];
  href?: string;
}) {
  const inner = (
    <div className="flex gap-4 p-5 border rounded-lg hover:border-rose transition-colors">
      <div className="size-10 rounded-full bg-blush flex items-center justify-center shrink-0">
        <Icon className="size-5 text-rose" />
      </div>
      <div>
        <h3 className="font-display font-semibold mb-1">{title}</h3>
        {lines.map((l) => (
          <p key={l} className="text-sm text-muted-foreground">
            {l}
          </p>
        ))}
      </div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}
