import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stock Info Aggregation",
  description: "Track your stocks and catalysts",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <nav className="border-b bg-secondary/50 backdrop-blur-md px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            StockMind
          </Link>
          <div className="flex gap-4 items-center">
            {session ? (
              <span className="text-sm text-muted-foreground">{session.user?.email}</span>
            ) : (
              <Link href="/api/auth/signin" className="text-sm font-medium hover:text-primary">Sign In</Link>
            )}
          </div>
        </nav>
        <main className="min-h-screen p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
