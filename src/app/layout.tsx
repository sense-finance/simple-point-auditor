import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rumpel Point Audit",
  description: "Audit our points",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="sticky z-50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center">
                <Image
                  src="/lockup.svg"
                  width="166"
                  height="24"
                  alt="Rumpel"
                  priority
                />
              </Link>

              <div className="absolute left-1/2 -translate-x-1/2">
                <span className="text-base font-medium text-gray-800">
                  Rumpel Point Audit Dashboard
                </span>
              </div>

              <nav className="flex items-center gap-4">
                <a
                  href="https://rumpel-docs.gitbook.io/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Docs
                </a>
                <button className="rounded-lg bg-primary-main px-4 py-1.5 text-sm text-white">
                  <a
                    href="https://app.rumpel.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Launch App
                  </a>
                </button>
              </nav>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
