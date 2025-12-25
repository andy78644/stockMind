import { Newspaper } from "lucide-react";

interface Report {
    id: string;
    date: Date;
    content: string;
}

export function ReportList({ reports }: { reports: Report[] }) {
    if (reports.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl text-muted-foreground">
                <Newspaper className="w-12 h-12 mb-4 opacity-20" />
                <p>No reports generated yet.</p>
                <p className="text-sm">Click "Generate AI Report" to fetch the latest insights.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {reports.map((report) => (
                <div key={report.id} className="border rounded-xl p-6 bg-card shadow-sm animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b">
                        <h3 className="font-semibold text-lg">Daily Briefing</h3>
                        <time className="text-sm text-muted-foreground">
                            {new Date(report.date).toLocaleDateString(undefined, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </time>
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap leading-relaxed">
                        {report.content}
                    </div>
                </div>
            ))}
        </div>
    );
}
