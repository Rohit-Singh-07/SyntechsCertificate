import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import logo from "@/assets/trendians-logo.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { findParticipant } from "@/lib/lookup";
import { CERTIFICATES, downloadCertificate } from "@/lib/certificates";
import type { Participant } from "@/data/participants";
import { Download, Search, ShieldCheck, Sparkles, Award } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Syntechs 2026 — Certificates by Trendians" },
      {
        name: "description",
        content:
          "Download your Syntechs 2026 hackathon certificates. Issued by Trendians, HackShastra and CodeChef.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [selected, setSelected] = useState<Participant | null>(null);

  const results = useMemo(
    () => (submitted ? findParticipant(submitted) : []),
    [submitted],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      toast.error("Enter your registration number, name, or email");
      return;
    }
    setSubmitted(q);
    setSelected(null);
    const r = findParticipant(q);
    if (r.length === 0) {
      toast.error("No participant found. Try a different identifier.");
    } else if (r.length === 1) {
      setSelected(r[0]);
    }
  };

  const downloadAll = () => {
    if (!selected) return;
    CERTIFICATES.forEach((c, i) => {
      setTimeout(
        () => downloadCertificate(c, selected.name, selected.reg),
        i * 350,
      );
    });
    toast.success(`Generating ${CERTIFICATES.length} certificates…`);
  };

  return (
    <div className="min-h-screen bg-hero">
      {/* Top bar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Trendians" className="h-9 w-auto" />
          <span className="hidden text-xs uppercase tracking-[0.2em] text-muted-foreground sm:inline">
            presents
          </span>
        </div>
        <span className="rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          Syntechs · 2026
        </span>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
        <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs text-gold">
            <Sparkles className="h-3 w-3" /> Certificates are now live
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Your <span className="text-gradient-gold">Syntechs 2026</span>
            <br /> certificates, ready to download.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Enter your registration number, name or email to instantly receive
            all five official certificates from Trendians, HackShastra and
            CodeChef.
          </p>

          <form
            onSubmit={onSubmit}
            className="mx-auto mt-10 flex max-w-xl flex-col gap-3 rounded-2xl border border-border bg-card/60 p-2 shadow-card-elev backdrop-blur sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. 12315063, your name, or email"
                className="h-12 border-0 bg-transparent pl-10 text-base focus-visible:ring-0"
              />
            </div>
            <Button
              type="submit"
              className="h-12 bg-gradient-to-r from-gold-soft to-gold px-6 font-semibold text-accent-foreground hover:opacity-95"
            >
              Find my certificates
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" /> Verified
              participant list
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-gold" /> 5 official
              certificates
            </span>
            <span>PDF · A4 landscape</span>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        {submitted && results.length > 1 && !selected && (
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <h2 className="text-sm font-medium text-muted-foreground">
              Multiple matches found — pick yours:
            </h2>
            <ul className="mt-4 divide-y divide-border">
              {results.map((p) => (
                <li
                  key={`${p.reg}-${p.name}`}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.reg || "—"} · {p.university}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelected(p)}
                  >
                    That's me
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selected && (
          <div>
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-gold/20 bg-card-grad p-6 shadow-glow sm:flex-row sm:items-center">
              <div>
                <p className="text-xs uppercase tracking-widest text-gold">
                  Welcome
                </p>
                <h2 className="mt-1 text-2xl font-semibold">{selected.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {selected.reg ? `Reg ${selected.reg} · ` : ""}
                  {selected.university || "Syntechs 2026"}
                </p>
              </div>
              <Button
                onClick={downloadAll}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                <Download className="mr-2 h-4 w-4" /> Download all 5
              </Button>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {CERTIFICATES.map((c, idx) => (
                <article
                  key={c.id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card-grad p-6 transition hover:border-gold/40 hover:shadow-glow"
                >
                  <div
                    className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl transition group-hover:opacity-40"
                    style={{ backgroundColor: c.accent }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-border bg-background/40 px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                      0{idx + 1}
                    </span>
                    <Award
                      className="h-5 w-5"
                      style={{ color: c.accent }}
                    />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold leading-snug">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                    {c.subtitle}
                  </p>
                  <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
                    {c.body(selected.name)}
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      Issued by{" "}
                      <span className="text-foreground">{c.issuer}</span>
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        downloadCertificate(c, selected.name, selected.reg)
                      }
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {submitted && results.length === 0 && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-muted-foreground">
            We couldn't find <span className="text-foreground">{submitted}</span>{" "}
            in our participant list. Double-check your registration number, or
            try your full name or email.
          </div>
        )}
      </section>

      <footer className="border-t border-border/60 bg-background/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Trendians" className="h-5 w-auto opacity-80" />
            <span>© Trendians · Syntechs 2026</span>
          </div>
          <span>In partnership with HackShastra · CodeChef</span>
        </div>
      </footer>
    </div>
  );
}
