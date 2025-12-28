"use client";

import Link from "next/link";
import { useState } from "react";
import { X, ExternalLink, ChevronRight } from "lucide-react";

export interface TagWithCount {
    id: string;
    name: string;
    type: string;
    _count: {
        catalysts: number;
        reports: number;
    };
    assessments: {
        id: string;
        date: Date;
        points: string[];
        sentiment: string;
        summary: string | null;
    }[];
}

export function WatchlistGrid({ tags }: { tags: TagWithCount[] }) {
    const [selectedAssessment, setSelectedAssessment] = useState<TagWithCount['assessments'][0] | null>(null);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tags.map((tag) => {
                    const latestAssessment = tag.assessments[0];
                    const sentimentColor = latestAssessment?.sentiment === 'POSITIVE' ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10' :
                        latestAssessment?.sentiment === 'NEGATIVE' ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' :
                            latestAssessment?.sentiment === 'NEUTRAL' ? 'border-gray-400 bg-gray-50/50 dark:bg-gray-800/10' :
                                'border-transparent';

                    return (
                        <div
                            key={tag.id}
                            className={`group relative block p-6 rounded-xl border bg-card transition-all hover:shadow-lg overflow-hidden ${latestAssessment ? 'border-l-4 ' + sentimentColor : 'hover:border-primary/50'}`}
                        >
                            <Link href={`/dashboard/${tag.id}`} className="absolute inset-0 z-0" />

                            <div className="relative z-10 flex justify-between items-start mb-4 pointer-events-none">
                                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">{tag.name}</h2>
                                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">{tag.type}</span>
                            </div>

                            {latestAssessment && (
                                <div className="relative z-10 mb-4 p-3 bg-secondary/30 rounded-lg text-sm group/card">
                                    <div className="flex items-center gap-2 mb-2 pointer-events-none">
                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${latestAssessment.sentiment === 'POSITIVE' ? 'bg-green-200 text-green-800' :
                                            latestAssessment.sentiment === 'NEGATIVE' ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'
                                            }`}>
                                            {latestAssessment.sentiment}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{new Date(latestAssessment.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="font-medium mb-1 line-clamp-2 pointer-events-none">{latestAssessment.summary}</p>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 pointer-events-none">
                                        {latestAssessment.points.slice(0, 2).map((point: string, i: number) => (
                                            <li key={i} className="line-clamp-1">{point}</li>
                                        ))}
                                    </ul>

                                    {/* Hover Overlay with Button */}
                                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSelectedAssessment(latestAssessment);
                                            }}
                                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium shadow-sm flex items-center gap-2 transform translate-y-2 group-hover/card:translate-y-0 transition-transform"
                                        >
                                            View Details <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="relative z-10 text-sm text-muted-foreground space-y-1 pointer-events-none">
                                <p>• {tag._count.catalysts} Catalysts watching</p>
                                <p>• {tag._count.reports} Reports generated</p>
                            </div>
                        </div>
                    );
                })}

                {tags.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        No tags yet. Create one to get started!
                    </div>
                )}
            </div>

            {/* Assessment Detail Modal */}
            {selectedAssessment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedAssessment(null)}>
                    <div
                        className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
                            <h3 className="text-xl font-bold">Daily Assessment Detail</h3>
                            <button onClick={() => setSelectedAssessment(null)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold px-2.5 py-1 rounded-md ${selectedAssessment.sentiment === 'POSITIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                    selectedAssessment.sentiment === 'NEGATIVE' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                    }`}>
                                    {selectedAssessment.sentiment}
                                </span>
                                <time className="text-sm text-muted-foreground">
                                    {new Date(selectedAssessment.date).toLocaleDateString(undefined, {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </time>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Summary</h4>
                                    <p className="text-lg leading-relaxed">{selectedAssessment.summary}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Key Points</h4>
                                    <ul className="space-y-3">
                                        {selectedAssessment.points.map((point, i) => (
                                            <li key={i} className="flex gap-3 items-start">
                                                <ChevronRight className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t bg-secondary/10">
                            <button
                                onClick={() => setSelectedAssessment(null)}
                                className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
