import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY not set, skipping email send');
    return;
  }

  const msg = {
    to,
    from: process.env.EMAIL_FROM || 'noreply@aitax.com',
    subject,
    text,
    html: html || text,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export interface User {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  trialEndDate: Date | null;
}

export async function sendTrialReminderEmail(user: User): Promise<void> {
  if (!user.trialEndDate) {
    return;
  }

  const daysLeft = Math.ceil((user.trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const userName = user.firstName ? ` ${user.firstName}` : '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Your Trial is Ending Soon${userName}</h1>
      <p>Your trial will end in ${daysLeft} days. Subscribe now to continue using our services and keep access to all premium features.</p>
      <div style="margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}/subscription" 
           style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Subscribe Now
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        If you have any questions about our subscription plans or need assistance, please don't hesitate to contact our support team.
      </p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Your AI Tax Prep Trial is Ending Soon',
    text: `Your trial will end in ${daysLeft} days. Subscribe now to continue using our services: ${process.env.NEXTAUTH_URL}/subscription`,
    html,
  });
}
