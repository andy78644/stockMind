"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Loader2 } from "lucide-react";

export function GenerateOverallButton({ tagId }: { tagId: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function generate() {
        setIsLoading(true);
        try {
            const res = await fetch("/api/reports/overall", {
                method: "POST",
                body: JSON.stringify({ tagId }),
            });
            if (!res.ok) throw new Error("Failed");

            startTransition(() => {
                router.refresh();
            });
        } catch (error) {
            alert("Error generating analysis. Check API Key or try again.");
        } finally {
            setIsLoading(false);
        }
    }

    const isBusy = isLoading || isPending;

    return (
        <button
            onClick={generate}
            disabled={isBusy}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isBusy ? <Loader2 className="animate-spin w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
            {isBusy ? "Analyzing..." : "Generate Overall Analysis"}
        </button>
    );
}
