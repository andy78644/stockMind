"use client";

import { BarChart3, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface OverallAnalysis {
    id: string;
    date: Date;
    content: string;
}

export function OverallAnalysisList({ analyses }: { analyses: OverallAnalysis[] }) {
    if (analyses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl text-muted-foreground">
                <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
                <p>No overall analysis generated yet.</p>
                <p className="text-sm">Click "Generate Overall Analysis" to get comprehensive insights.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {analyses.map((analysis) => (
                <div key={analysis.id} className="border rounded-xl p-6 bg-card shadow-sm animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b">
                        <h3 className="font-semibold text-lg">Overall Analysis</h3>
                        <time className="text-sm text-muted-foreground" suppressHydrationWarning>
                            {new Date(analysis.date).toLocaleDateString(undefined, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </time>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed prose-p:leading-7 prose-headings:mb-4 prose-headings:mt-6">
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
                            }}
                        >
                            {analysis.content}
                        </ReactMarkdown>
                    </div>
                </div>
            ))}
        </div>
    );
}
