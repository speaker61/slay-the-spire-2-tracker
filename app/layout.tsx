import type { Metadata } from "next";
import { Geist_Mono, Kreon } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const kreon = Kreon({
  variable: "--font-kreon",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Spire Scout",
  description: "Slay the Spire 2 card comparison tool",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${kreon.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0d0d1a]">{children}</body>
    </html>
  )
}
