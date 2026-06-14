import { getDb } from "./db";
import { validationSessions } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { generateValidationReport, PaperTradingSession } from "./paperTradingValidator";
import { sendEmail } from "./emailNotifications"; // Assuming an email sending utility exists

export async function processWeeklyReports() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available for weekly report processing.");
    return;
  }

  // Fetch all active validation sessions
  const activeSessions = await db.select().from(validationSessions).where(eq(validationSessions.status, "ACTIVE"));

  for (const sessionRecord of activeSessions) {
    try {
      if (!sessionRecord.ownerEmail) {
        console.warn(`Session ${sessionRecord.sessionId} has no owner email. Skipping report.`);
        continue;
      }

      const session: PaperTradingSession = {
        id: sessionRecord.id,
        userId: sessionRecord.userId,
        sessionId: sessionRecord.sessionId,
        startDate: sessionRecord.startDate,
        startingCapital: sessionRecord.startingCapital.toNumber(),
        currentCapital: sessionRecord.currentCapital.toNumber(),
        config: JSON.parse(sessionRecord.config),
        status: sessionRecord.status,
        ownerEmail: sessionRecord.ownerEmail,
      };

      const report = await generateValidationReport(session);

      const emailSubject = `Weekly Stock Predictor Validation Report for Session ${session.sessionId}`;
      const emailBody = `
        Dear ${session.ownerEmail},

        Here is your weekly validation report for session ${session.sessionId}:

        Validation Status: ${report.validationStatus}
        Total Return: ${(report.totalReturnPercent * 100).toFixed(2)}%
        Win Rate: ${(report.overallMetrics.winRate * 100).toFixed(2)}%
        Sharpe Ratio: ${report.overallMetrics.sharpeRatio.toFixed(2)}
        Max Drawdown: ${(report.overallMetrics.maxDrawdown * 100).toFixed(2)}%

        Recommendations:
        ${report.recommendations.map(r => `- ${r}`).join('\n')}

        You can view the full report and detailed metrics on your dashboard.

        Best regards,
        The Stock Predictor Team
      `;

      await sendEmail({
        to: session.ownerEmail,
        subject: emailSubject,
        htmlContent: emailBody, // Assuming the emailBody is HTML content
        textContent: emailBody, // For plain text clients
      });
      console.log(`Weekly report sent for session ${session.sessionId} to ${session.ownerEmail}`);

    } catch (error) {
      console.error(`Failed to process weekly report for session ${sessionRecord.sessionId}:`, error);
    }
  }
}
