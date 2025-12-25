"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";

export function CreateTagForm() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState("COMPANY");

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, type }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to create tag");
            }

            setName("");
            setIsOpen(false);
            router.refresh();
        } catch (error: any) {
            setError(error.message);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
                <Plus size={16} />
                Add Tag
            </button>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            <form onSubmit={onSubmit} className="flex gap-2 items-center bg-card p-2 rounded-lg border animate-in fade-in slide-in-from-right-4">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name (e.g. Tesla)"
                    className="bg-transparent border rounded px-3 py-1 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                />
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="bg-transparent border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="COMPANY">Company</option>
                    <option value="INDUSTRY">Industry</option>
                </select>
                <button
                    disabled={isLoading}
                    type="submit"
                    className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Save"}
                </button>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-2 py-1 text-muted-foreground hover:text-foreground text-sm"
                >
                    Cancel
                </button>
            </form>
            {error && <p className="text-xs text-destructive px-2 font-medium">{error}</p>}
        </div>
    )
}
