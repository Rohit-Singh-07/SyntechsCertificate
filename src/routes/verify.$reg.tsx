import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/trendians-logo.svg";
import { PARTICIPANTS } from "@/data/participants";
import { CERTIFICATES, type CertificateId } from "@/lib/certificates";
import { Award, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const digits = (s: string) => s.replace(/\D/g, "");

export const Route = createFileRoute("/verify/$reg")({
  validateSearch: (s: Record<string, unknown>) => ({
    c: typeof s.c === "string" ? (s.c as CertificateId) : undefined,
  }),
  head: ({ params }) => ({
    meta: [
      { title: `Verify Certificate · ${params.reg} · Syntechs 2026` },
      {
        name: "description",
        content: `Verification of Syntechs 2026 certificate issued to registration ${params.reg}.`,
      },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const { reg } = Route.useParams();
  const { c } = Route.useSearch();
  const qd = digits(reg);
  const participant = PARTICIPANTS.find(
    (p) => p.reg && (p.reg === reg || (qd && digits(p.reg) === qd)),
  );
  const highlighted = c ? CERTIFICATES.find((x) => x.id === c) : undefined;

  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Trendians" className="h-9 w-auto" />
          <span className="hidden text-xs uppercase tracking-[0.2em] text-muted-foreground sm:inline">
            Syntechs 2026
          </span>
        </Link>
        <span className="rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          Certificate Verification
        </span>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24">
        {participant ? (
          <div className="overflow-hidden rounded-3xl border border-gold/20 bg-card-grad shadow-glow">
            <div className="flex items-center gap-3 border-b border-border/60 bg-background/30 px-6 py-4">
              <CheckCircle2 className="h-5 w-5 text-gold" />
              <div>
                <p className="text-sm font-medium">Verified · Authentic</p>
                <p className="text-xs text-muted-foreground">
                  This certificate was officially issued for Syntechs 2026.
                </p>
              </div>
            </div>

            <div className="px-6 py-8">
              <p className="text-xs uppercase tracking-widest text-gold">
                Issued to
              </p>
              <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
                {participant.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Registration {participant.reg} · {participant.university}
              </p>

              {highlighted && (
                <div className="mt-6 rounded-2xl border border-border bg-background/40 p-5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                    <Award
                      className="h-4 w-4"
                      style={{ color: highlighted.accent }}
                    />
                    Scanned certificate
                  </div>
                  <h2 className="mt-2 text-xl font-semibold">
                    {highlighted.title}
                  </h2>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {highlighted.subtitle}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Issued by{" "}
                    <span className="text-foreground">{highlighted.issuer}</span>
                    {highlighted.coIssuer
                      ? ` in partnership with ${highlighted.coIssuer}`
                      : ""}
                    .
                  </p>
                </div>
              )}

              <div className="mt-8">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  All certificates issued
                </p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {CERTIFICATES.map((cert) => (
                    <li
                      key={cert.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 ${
                        highlighted?.id === cert.id
                          ? "border-gold/40 bg-gold/5"
                          : "border-border bg-background/30"
                      }`}
                    >
                      <Award
                        className="h-4 w-4 shrink-0"
                        style={{ color: cert.accent }}
                      />
                      <div>
                        <p className="text-sm font-medium leading-tight">
                          {cert.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cert.issuer}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 flex items-center justify-between gap-3 rounded-xl border border-border bg-background/30 px-4 py-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-gold" /> Verified against
                  the official Trendians participant registry.
                </span>
                <Link to="/">
                  <Button size="sm" variant="secondary">
                    Open portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <XCircle className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="mt-4 text-2xl font-semibold">
              Certificate not recognised
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              We couldn't find a participant with registration{" "}
              <span className="text-foreground">{reg}</span> in the official
              Syntechs 2026 registry. This certificate could not be verified.
            </p>
            <Link to="/" className="mt-6 inline-block">
              <Button variant="secondary">Back to portal</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
