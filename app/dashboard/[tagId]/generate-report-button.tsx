"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

export function GenerateReportButton({ tagId }: { tagId: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function generate() {
        setIsLoading(true);
        try {
            const res = await fetch("/api/reports/generate", {
                method: "POST",
                body: JSON.stringify({ tagId }),
            });
            if (!res.ok) throw new Error("Failed");

            startTransition(() => {
                router.refresh();
            });
        } catch (error) {
            alert("Error generating report. Check API Key or try again.");
        } finally {
            setIsLoading(false);
        }
    }

    const isBusy = isLoading || isPending;

    return (
        <button
            onClick={generate}
            disabled={isBusy}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full font-medium shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isBusy ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            {isBusy ? "Analyzing..." : "Generate AI Report"}
        </button>
    );
}
