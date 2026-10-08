import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend = new Resend(process.env.RESEND_API_KEY);

  // Change this once you've verified a domain in Resend.
  // Until then, onboarding@resend.dev only sends to the Resend account owner's email.
  private readonly fromAddress =
    process.env.EMAIL_FROM ?? "OpsFlow <onboarding@resend.dev>";

  async sendActivationEmail(to: string, name: string, activationLink: string) {
    const { data, error } = await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject: "Activate your OpsFlow account",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1A1A1A;">Welcome to OpsFlow, ${name}</h2>
          <p style="color: #444;">An administrator has created an account for you. Click below to set your password and activate your account.</p>
          <a href="${activationLink}" style="display: inline-block; background: #1A1A1A; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
            Activate Account
          </a>
          <p style="color: #888; font-size: 13px; margin-top: 24px;">This link expires in 48 hours.</p>
        </div>
      `,
    });

    if (error) {
      this.logger.error(
        `Failed to send activation email to ${to}: ${JSON.stringify(error)}`
      );
      throw new Error(`Email delivery failed: ${error.message}`);
    }

    this.logger.log(`Activation email sent to ${to} (id: ${data?.id})`);
    return data;
  }

  async sendPasswordResetEmail(to: string, name: string, resetLink: string) {
    const { data, error } = await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject: "Reset your OpsFlow password",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1A1A1A;">Password reset requested</h2>
          <p style="color: #444;">Hi ${name}, click below to set a new password. If you didn't request this, you can safely ignore this email.</p>
          <a href="${resetLink}" style="display: inline-block; background: #1A1A1A; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
            Reset Password
          </a>
          <p style="color: #888; font-size: 13px; margin-top: 24px;">This link expires in 1 hour.</p>
        </div>
      `,
    });

    if (error) {
      this.logger.error(
        `Failed to send password reset email to ${to}: ${JSON.stringify(error)}`
      );
      throw new Error(`Email delivery failed: ${error.message}`);
    }

    this.logger.log(`Password reset email sent to ${to} (id: ${data?.id})`);
    return data;
  }
}