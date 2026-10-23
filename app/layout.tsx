import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Newsreader, Schibsted_Grotesk } from "next/font/google";
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/components.css";
import "@/styles/pages.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { DemoStrip } from "@/components/layout/DemoStrip";
import { RevealObserver } from "@/components/layout/RevealObserver";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { isDemo } from "@/lib/commerce/catalog";
import { shippingMethods, siteUrl } from "@/lib/commerce/settings";

// Só os dois cortes usados (romano 400, itálico 300) — evita ~280 KB do ficheiro variável com eixo óptico.
const display = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  weight: "400",
  style: "normal",
  display: "swap",
});

const displayItalic = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader-italic",
  weight: "300",
  style: "italic",
  display: "swap",
});

const sans = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
});

const DESCRIPTION =
  "Interiores, pijamas, roupa térmica e meias para mulher, homem e criança. Marcas escolhidas pela X Íntimo, com envio para Portugal.";

export function generateMetadata(): Metadata {
  const demo = isDemo();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: "X Íntimo — Interiores, pijamas, térmica e meias", template: "%s · X Íntimo" },
    description: DESCRIPTION,
    applicationName: "X Íntimo",
    openGraph: { type: "website", locale: "pt_PT", siteName: "X Íntimo", description: DESCRIPTION },
    twitter: { card: "summary_large_image" },
    // Em modo demonstração o site não deve ser indexado.
    robots: demo ? { index: false, follow: false } : { index: true, follow: true },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#f7f3ec",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const demo = isDemo();
  const freeShippingFrom =
    shippingMethods().find((m) => m.regions !== "pickup" && m.regions.includes("continente"))?.freeFrom ?? null;
  return (
    <html lang="pt-PT" className={`${display.variable} ${displayItalic.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a className="skip-link" href="#conteudo">
          Saltar para o conteúdo
        </a>
        <CartProvider freeShippingFrom={freeShippingFrom}>
          {demo ? <DemoStrip /> : null}
          <SiteHeader />
          <main id="conteudo" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter />
        </CartProvider>
        <RevealObserver />
      </body>
    </html>
  );
}
