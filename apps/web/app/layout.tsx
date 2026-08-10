import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Oja | Fresh food subscriptions",
  description:
    "A premium subscription for fresh groceries, staples, and pantry essentials delivered on your schedule.",
  openGraph: {
    title: "Oja | Fresh food subscriptions",
    description:
      "Fresh groceries, staples, and pantry essentials delivered on your schedule.",
    type: "website",
    locale: "en_NG",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="bg-[var(--paper)] text-[var(--ink)]">{children}</body>
    </html>
  );
}
