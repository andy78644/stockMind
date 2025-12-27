
import "dotenv/config"; // Ensure env vars are loaded
import { prisma } from "../lib/db";
import { sendDailyReportEmail } from "../lib/email";

async function main() {
    console.log("Checking for users...");
    const user = await prisma.user.findFirst({
        where: { email: { not: undefined } }
    });

    if (!user || !user.email) {
        console.error("No user found with an email address to test with.");
        return;
    }

    console.log(`Sending test email to: ${user.email}`);

    try {
        const html = `
      <h1>Test Email</h1>
      <p>This is a test email from StockMind to verify your Resend configuration.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
    `;

        await sendDailyReportEmail(user.email, html);
        console.log("Test email sent successfully!");
    } catch (error) {
        console.error("Failed to send test email:", error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
