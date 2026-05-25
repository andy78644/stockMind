"use client";

import { useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

export function NotificationToggle({ enabled }: { enabled: boolean }) {
    const [isEnabled, setIsEnabled] = useState(enabled);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function toggle() {
        const next = !isEnabled;
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/user/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: next }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to update preference");
            }

            setIsEnabled(next);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update preference");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                onClick={toggle}
                disabled={isLoading}
                title={isEnabled ? "每日 Email 通知已開啟，點擊以停用" : "每日 Email 通知已停用，點擊以開啟"}
                className="flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors hover:bg-secondary/50 disabled:opacity-50"
            >
                {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : isEnabled ? (
                    <Bell size={16} className="text-green-500" />
                ) : (
                    <BellOff size={16} className="text-muted-foreground" />
                )}
                <span>{isEnabled ? "通知已開啟" : "通知已停用"}</span>
            </button>
            {error && <p className="text-xs text-destructive font-medium">{error}</p>}
        </div>
    );
}
