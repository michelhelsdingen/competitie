import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "LTC de Kei - Interne Competitie",
  description: "Uitslagen en stand van de interne padel competitie bij LTC de Kei",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`h-full antialiased ${openSans.variable}`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-open-sans), Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
