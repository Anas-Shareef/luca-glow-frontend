import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Heart, Leaf } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Luca | Clean Beauty Made for Everyone" },
      { name: "description", content: "Our story, mission, and commitment to clean, cruelty-free beauty." },
      { property: "og:title", content: "About Luca Cosmetics" },
      { property: "og:description", content: "Pure, cruelty-free, ethically sourced." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <div
        className="h-[50vh] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=80)",
        }}
      >
        <div className="text-center text-background bg-foreground/30 backdrop-blur-sm px-8 py-6 rounded-lg">
          <p className="text-xs uppercase tracking-[0.3em] mb-2">Our Story</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold">FEEL THE CHANGE</h1>
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg text-muted-foreground leading-relaxed">
          Luca Cosmetics is a labour of love rooted in Kerala, India. We believe beauty should be
          honest — made using clean, non-toxic ingredients, our products are designed for
          everyone. No harsh chemicals. No animal testing. Just pure, effective formulations
          that let you feel the change.
        </p>
      </section>

      <section className="bg-blush/30 py-16 px-4">
        <div className="mx-auto max-w-7xl grid md:grid-cols-3 gap-12 text-center">
          {[
            { icon: Sparkles, title: "Guaranteed PURE", text: "Strict purity standards. Never harsh or toxic ingredients." },
            { icon: Heart, title: "Completely Cruelty-Free", text: "Never tested on animals. Ever." },
            { icon: Leaf, title: "Ingredient Sourcing", text: "Quality and sustainability from ethical suppliers." },
          ].map((v) => (
            <div key={v.title}>
              <div className="size-14 mx-auto mb-4 rounded-full bg-background flex items-center justify-center">
                <v.icon className="size-6 text-rose" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
