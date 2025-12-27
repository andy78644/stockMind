import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDailyReportEmail(to: string, html: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not set, skipping email.");
        return;
    }

    try {
        const data = await resend.emails.send({
            from: 'stockmind@andy78644.com', // Or user's verified domain
            to: to,
            subject: `每日投資速報 - ${new Date().toISOString().split("T")[0]}`,
            html: html,
        });

        console.log("Email sent successfully:", data);
        return data;
    } catch (error) {
        console.error("Error sending email via Resend:", error);
        throw error;
    }
}
