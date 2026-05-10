import { Resend } from 'resend';

// Resend v6 throws if instantiated with an undefined key. Next.js's
// "Collecting page data" build step evaluates server modules without
// runtime env, so we must defer construction until first use.
let resendClient: Resend | null = null;

function getResend(): Resend | null {
    const key = process.env.RESEND_API_KEY;
    if (!key) return null;
    if (!resendClient) resendClient = new Resend(key);
    return resendClient;
}

export async function sendDailyReportEmail(to: string, html: string, subject?: string) {
    const resend = getResend();
    if (!resend) {
        console.warn("RESEND_API_KEY is not set, skipping email.");
        return;
    }

    try {
        const data = await resend.emails.send({
            from: 'stockmind@andy78644.com', // Or user's verified domain
            to: to,
            subject: subject ?? `每日投資速報 - ${new Date().toISOString().split("T")[0]}`,
            html: html,
        });

        console.log("Email sent successfully:", data);
        return data;
    } catch (error) {
        console.error("Error sending email via Resend:", error);
        throw error;
    }
}
