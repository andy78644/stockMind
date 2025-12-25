"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Target } from "lucide-react";

interface Catalyst {
    id: string;
    content: string;
}

export function CatalystSection({ tagId, initialCatalysts }: { tagId: string, initialCatalysts: Catalyst[] }) {
    const router = useRouter();
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();

    async function addCatalyst(e: React.FormEvent) {
        e.preventDefault();
        await fetch("/api/catalysts", {
            method: "POST",
            body: JSON.stringify({ tagId, content }),
        });
        setContent("");
        startTransition(() => {
            router.refresh();
        });
    }

    return (
        <div className="space-y-4 border rounded-xl p-6 bg-card">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Catalysts
            </h3>
            <p className="text-sm text-muted-foreground">
                Events or metrics to monitor for this tag.
            </p>

            <ul className="space-y-3">
                {initialCatalysts.map((c) => (
                    <li key={c.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 text-sm">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span>{c.content}</span>
                    </li>
                ))}
                {initialCatalysts.length === 0 && (
                    <li className="text-sm text-muted-foreground italic">No catalysts defined yet.</li>
                )}
            </ul>

            <form onSubmit={addCatalyst} className="flex gap-2">
                <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add catalyst (e.g. Q3 Earnings)"
                    className="flex-1 bg-background border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                />
                <button
                    disabled={isPending}
                    type="submit"
                    className="bg-primary text-primary-foreground p-2 rounded hover:bg-primary/90 disabled:opacity-50"
                >
                    <Plus size={18} />
                </button>
            </form>
        </div>
    );
}
