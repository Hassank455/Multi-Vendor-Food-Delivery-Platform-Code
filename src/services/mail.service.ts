import nodemailer from "nodemailer";

export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAILTRAP_PORT),
    secure: false,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });

  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }) {
    return await this.transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }
}
