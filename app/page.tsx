import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
        StockMind AI
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl">
        Intelligent aggregator for stock and industry news. Define your catalysts, let AI find the signal in the noise.
      </p>
      <Link
        href="/api/auth/signin"
        className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
      >
        Get Started
      </Link>
    </div>
  );
}
