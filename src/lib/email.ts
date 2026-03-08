interface GoalReminderParams {
  to: string;
  name: string;
  current: number;
  target: number;
  remaining: number;
  isUrgent: boolean;
}

export async function sendGoalReminderEmail(params: GoalReminderParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[email] RESEND_API_KEY not set — skipping email to", params.to);
    return;
  }

  const fromAddress =
    process.env.EMAIL_FROM || "Elevate Learning <noreply@elevatelearning.ai>";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const subject = params.isUrgent
    ? `⏰ Weekly Goal Reminder — ${params.remaining} assignment${params.remaining > 1 ? "s" : ""} left!`
    : `📊 Weekly Goal Check-In — You're ${Math.round((params.current / params.target) * 100)}% there!`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; color: white;">
          ${params.isUrgent ? "⏰ Time's Running Out!" : "📊 Weekly Goal Update"}
        </h1>
      </div>
      <div style="padding: 32px 24px;">
        <p style="margin: 0 0 16px; font-size: 16px;">Hi ${params.name},</p>
        <p style="margin: 0 0 24px; font-size: 14px; color: #94a3b8; line-height: 1.6;">
          ${
            params.isUrgent
              ? "The week is almost over and you haven't hit your study goal yet. You still have time!"
              : "Here's a quick update on your weekly study goal progress."
          }
        </p>
        <div style="background: #1e293b; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; font-size: 36px; font-weight: bold; color: white;">
            ${params.current} / ${params.target}
          </p>
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">assignments completed this week</p>
          <div style="background: #334155; border-radius: 100px; height: 8px; margin-top: 16px; overflow: hidden;">
            <div style="background: linear-gradient(90deg, #4f46e5, #7c3aed); height: 100%; width: ${Math.round((params.current / params.target) * 100)}%; border-radius: 100px;"></div>
          </div>
          <p style="margin: 8px 0 0; font-size: 12px; color: ${params.isUrgent ? "#fbbf24" : "#818cf8"};">
            ${params.remaining} more to reach your goal
          </p>
        </div>
        <a href="${appUrl}/dashboard/student" style="display: block; text-align: center; background: #4f46e5; color: white; text-decoration: none; padding: 14px; border-radius: 10px; font-weight: 600; font-size: 14px;">
          Open Elevate Dashboard
        </a>
        <p style="margin: 24px 0 0; font-size: 12px; color: #475569; text-align: center;">
          You're receiving this because you set a weekly study goal on Elevate Learning.
        </p>
      </div>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: fromAddress, to: params.to, subject, html }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[email] Resend error:", res.status, body);
    }
  } catch (err) {
    console.error("[email] Failed to send:", err);
  }
}
