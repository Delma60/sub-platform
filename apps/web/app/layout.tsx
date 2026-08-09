import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Oja | Fresh food subscriptions",
  description:
    "A premium subscription for fresh groceries, staples, and pantry essentials delivered on your schedule.",
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
