import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import workSansRegularUrl from "@/assets/fonts/WorkSans-Regular.ttf?url";
import workSansBoldUrl from "@/assets/fonts/WorkSans-Bold.ttf?url";
import loraItalicUrl from "@/assets/fonts/Lora-Italic.ttf?url";
import { SITE_URL } from "@/lib/site";

const SANS = "WorkSans";
const SERIF = "Lora";

let fontsCache: { regular: string; bold: string; italic: string } | null = null;
let fontsPromise: Promise<{ regular: string; bold: string; italic: string }> | null = null;

async function fetchAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)),
    );
  }
  return btoa(binary);
}

async function loadFonts() {
  if (fontsCache) return fontsCache;
  if (!fontsPromise) {
    fontsPromise = (async () => {
      const [regular, bold, italic] = await Promise.all([
        fetchAsBase64(workSansRegularUrl),
        fetchAsBase64(workSansBoldUrl),
        fetchAsBase64(loraItalicUrl),
      ]);
      fontsCache = { regular, bold, italic };
      return fontsCache;
    })();
  }
  return fontsPromise;
}

function registerFonts(
  doc: jsPDF,
  fonts: { regular: string; bold: string; italic: string },
) {
  doc.addFileToVFS("WorkSans-Regular.ttf", fonts.regular);
  doc.addFont("WorkSans-Regular.ttf", SANS, "normal");
  doc.addFileToVFS("WorkSans-Bold.ttf", fonts.bold);
  doc.addFont("WorkSans-Bold.ttf", SANS, "bold");
  doc.addFileToVFS("Lora-Italic.ttf", fonts.italic);
  doc.addFont("Lora-Italic.ttf", SERIF, "italic");
}

export type CertificateId =
  | "participation"
  | "quantum"
  | "hackathon-win"
  | "completion"
  | "innovation";

export interface CertificateMeta {
  id: CertificateId;
  title: string;
  subtitle: string;
  body: (name: string) => string;
  issuer: string;
  coIssuer?: string;
  accent: string; // hex
}

export const CERTIFICATES: CertificateMeta[] = [
  {
    id: "participation",
    title: "Certificate of Participation",
    subtitle: "Syntechs 2026 Hackathon",
    body: (name) =>
      `This is to certify that ${name} actively participated in Syntechs 2026, a national-level hackathon organised by Trendians, demonstrating remarkable enthusiasm, teamwork and technical curiosity throughout the event.`,
    issuer: "Trendians",
    accent: "#E6B84A",
  },
  {
    id: "quantum",
    title: "Quantum Computing Session",
    subtitle: "Knowledge Session — Syntechs 2026",
    body: (name) =>
      `This is to certify that ${name} successfully attended the Quantum Computing knowledge session conducted as part of Syntechs 2026, gaining valuable exposure to the foundations and emerging applications of quantum technologies.`,
    issuer: "Trendians",
    accent: "#7DD3FC",
  },
  {
    id: "hackathon-win",
    title: "How to Win a Hackathon",
    subtitle: "Mentorship Session — Syntechs 2026",
    body: (name) =>
      `This is to certify that ${name} attended the “How to Win a Hackathon” session at Syntechs 2026, learning proven strategies on ideation, execution, pitching and team dynamics from industry mentors.`,
    issuer: "Trendians",
    accent: "#A78BFA",
  },
  {
    id: "completion",
    title: "Hackathon Completion Certificate",
    subtitle: "Syntechs 2026 — Issued by HackShastra",
    body: (name) =>
      `This is to certify that ${name} successfully completed the Syntechs 2026 Hackathon, building and submitting a working project within the stipulated time, and upholding the spirit of innovation, collaboration and resilience.`,
    issuer: "HackShastra",
    coIssuer: "Trendians",
    accent: "#F472B6",
  },
  {
    id: "innovation",
    title: "Innovation & Problem-Solving",
    subtitle: "Recognition by CodeChef — Syntechs 2026",
    body: (name) =>
      `This is to certify that ${name} demonstrated exemplary innovation and problem-solving capabilities at Syntechs 2026, reflecting the values championed by CodeChef in nurturing the next generation of engineers and creators.`,
    issuer: "CodeChef",
    coIssuer: "Trendians",
    accent: "#34D399",
  },
];

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};

function wrap(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth);
}

export function getVerifyUrl(registration: string, certId: CertificateId): string {
  const base = SITE_URL.replace(/\/$/, "");
  const reg = encodeURIComponent(registration || "unknown");
  return `${base}/verify/${reg}?c=${certId}`;
}

export async function buildCertificatePdf(
  cert: CertificateMeta,
  participantName: string,
  registration: string,
): Promise<jsPDF> {
  const fonts = await loadFonts();
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  registerFonts(doc, fonts);
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const [ar, ag, ab] = hexToRgb(cert.accent);

  // ---------- Background ----------
  doc.setFillColor(10, 10, 12);
  doc.rect(0, 0, W, H, "F");

  // Inner panel
  doc.setFillColor(17, 17, 21);
  doc.roundedRect(28, 28, W - 56, H - 56, 16, 16, "F");

  // ---------- Frames ----------
  // Outer accent frame
  doc.setDrawColor(ar, ag, ab);
  doc.setLineWidth(1.4);
  doc.roundedRect(40, 40, W - 80, H - 80, 12, 12, "S");

  // Inner thin frame
  doc.setDrawColor(70, 70, 78);
  doc.setLineWidth(0.4);
  doc.roundedRect(52, 52, W - 104, H - 104, 9, 9, "S");

  // Corner brackets
  const cornerLen = 26;
  const cornerInset = 64;
  const corner = (x: number, y: number, sx: number, sy: number) => {
    doc.setDrawColor(ar, ag, ab);
    doc.setLineWidth(2);
    doc.line(x, y, x + cornerLen * sx, y);
    doc.line(x, y, x, y + cornerLen * sy);
  };
  corner(cornerInset, cornerInset, 1, 1);
  corner(W - cornerInset, cornerInset, -1, 1);
  corner(cornerInset, H - cornerInset, 1, -1);
  corner(W - cornerInset, H - cornerInset, -1, -1);

  // ---------- Top eyebrow ----------
  doc.setFont(SANS, "normal");
  doc.setFontSize(10);
  doc.setTextColor(170, 170, 175);
  doc.text("TRENDIANS  ·  SYNTECHS 2026", W / 2, 100, { align: "center" });

  // tiny diamond divider
  const drawDiamond = (cx: number, cy: number, r: number) => {
    doc.setFillColor(ar, ag, ab);
    doc.triangle(cx - r, cy, cx, cy - r, cx + r, cy, "F");
    doc.triangle(cx - r, cy, cx, cy + r, cx + r, cy, "F");
  };
  doc.setDrawColor(ar, ag, ab);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 70, 112, W / 2 - 8, 112);
  doc.line(W / 2 + 8, 112, W / 2 + 70, 112);
  drawDiamond(W / 2, 112, 3);

  // ---------- Title ----------
  doc.setFont(SANS, "bold");
  // Auto-fit title within the inner frame
  let titleSize = 32;
  doc.setFontSize(titleSize);
  while (doc.getTextWidth(cert.title) > W - 240 && titleSize > 20) {
    titleSize -= 1;
    doc.setFontSize(titleSize);
  }
  doc.setTextColor(245, 245, 248);
  doc.text(cert.title, W / 2, 158, { align: "center" });

  // Subtitle
  doc.setFont(SANS, "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(ar, ag, ab);
  doc.text(cert.subtitle.toUpperCase(), W / 2, 180, {
    align: "center",
    charSpace: 1.4,
  });

  // "Presented to"
  doc.setFont(SANS, "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(150, 150, 158);
  doc.text("THIS CERTIFICATE IS PROUDLY PRESENTED TO", W / 2, 220, {
    align: "center",
    charSpace: 1.8,
  });

  // ---------- Name ----------
  doc.setFont(SERIF, "italic");
  let nameSize = 50;
  doc.setFontSize(nameSize);
  while (doc.getTextWidth(participantName) > W - 260 && nameSize > 26) {
    nameSize -= 2;
    doc.setFontSize(nameSize);
  }
  doc.setTextColor(248, 248, 250);
  doc.text(participantName, W / 2, 282, { align: "center" });

  // Underline under name
  const nameWidth = Math.min(doc.getTextWidth(participantName) + 80, W - 220);
  doc.setDrawColor(ar, ag, ab);
  doc.setLineWidth(0.8);
  doc.line(W / 2 - nameWidth / 2, 298, W / 2 + nameWidth / 2, 298);

  // ---------- Body ----------
  doc.setFont(SANS, "normal");
  doc.setFontSize(11.5);
  doc.setTextColor(200, 200, 208);
  const bodyLines = wrap(doc, cert.body(participantName), W - 280);
  doc.text(bodyLines, W / 2, 336, { align: "center", lineHeightFactor: 1.55 });

  // ---------- Footer signatures (left + right) ----------
  const footerY = H - 130;
  const sigLineW = 140;
  const leftCx = 180;
  const rightCx = W - 180;

  doc.setDrawColor(120, 120, 128);
  doc.setLineWidth(0.5);
  doc.line(leftCx - sigLineW / 2, footerY, leftCx + sigLineW / 2, footerY);
  doc.line(rightCx - sigLineW / 2, footerY, rightCx + sigLineW / 2, footerY);

  doc.setFont(SANS, "bold");
  doc.setFontSize(11);
  doc.setTextColor(232, 232, 238);
  doc.text(cert.issuer, leftCx, footerY + 16, { align: "center" });
  doc.setFont(SANS, "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(150, 150, 158);
  doc.text("Issuing Organisation", leftCx, footerY + 30, { align: "center" });

  doc.setFont(SANS, "bold");
  doc.setFontSize(11);
  doc.setTextColor(232, 232, 238);
  doc.text(cert.coIssuer ?? "Trendians", rightCx, footerY + 16, {
    align: "center",
  });
  doc.setFont(SANS, "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(150, 150, 158);
  doc.text("Organising Partner", rightCx, footerY + 30, { align: "center" });

  // ---------- Centre QR plate (sits between body and signature row) ----------
  const verifyUrl = getVerifyUrl(registration, cert.id);
  const qrSize = 50;
  const qrPadY = 6;
  const plateW = 84;
  const plateH = qrSize + qrPadY * 2 + 11;
  const plateX = W / 2 - plateW / 2;
  const plateY = footerY - plateH - 8; // sits clear above the signature line
  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 320,
      color: { dark: "#0a0a0c", light: "#f6f6f9" },
      errorCorrectionLevel: "M",
    });
    doc.setFillColor(246, 246, 249);
    doc.roundedRect(plateX, plateY, plateW, plateH, 6, 6, "F");
    doc.setDrawColor(ar, ag, ab);
    doc.setLineWidth(0.8);
    doc.roundedRect(plateX - 2, plateY - 2, plateW + 4, plateH + 4, 7, 7, "S");
    doc.addImage(
      qrDataUrl,
      "PNG",
      plateX + (plateW - qrSize) / 2,
      plateY + qrPadY,
      qrSize,
      qrSize,
    );
    doc.setFont(SANS, "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(40, 40, 46);
    doc.text("SCAN TO VERIFY", plateX + plateW / 2, plateY + plateH - 5, {
      align: "center",
      charSpace: 0.8,
    });
  } catch {
    // QR failure must not break the PDF
  }

  // ---------- Bottom meta strip (centred) ----------
  doc.setFont(SANS, "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(130, 130, 138);
  const certCode = `SYN26-${cert.id.toUpperCase()}-${(registration || "GUEST").toString().slice(-6)}`;
  const issued = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const metaParts = [
    `ID  ${certCode}`,
    registration ? `Reg  ${registration}` : null,
    `Issued  ${issued}`,
  ].filter(Boolean) as string[];
  doc.text(metaParts.join("    ·    "), W / 2, H - 70, {
    align: "center",
    charSpace: 0.3,
  });

  return doc;
}

export async function downloadCertificate(
  cert: CertificateMeta,
  participantName: string,
  registration: string,
) {
  const doc = await buildCertificatePdf(cert, participantName, registration);
  const safeName = participantName.replace(/[^a-z0-9]+/gi, "_");
  doc.save(`Syntechs2026_${cert.id}_${safeName}.pdf`);
}
