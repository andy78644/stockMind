"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Target, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown
                                components={{
                                    a: ({ ...props }) => (
                                        <a
                                            {...props}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors"
                                        >
                                            {props.children}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ),
                                    p: ({ ...props }) => <span {...props} />, // Prevent p tag in list items to keep layout tight
                                }}
                            >
                                {c.content}
                            </ReactMarkdown>
                        </div>
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
