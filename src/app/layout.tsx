import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Startup Expo 2026 | Ideas to Innovation",
  description:
    "Three-day startup exhibition. Showcase products, meet investors, generate leads and grow your business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-white text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
