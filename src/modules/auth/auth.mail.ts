export function buildVerificationEmail(name: string, code: string) {
  return {
    subject: "Verify your email",
    text: `Hello ${name}, your verification code is: ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Email Verification</h2>
        <p>Hello ${name},</p>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 4px;">${code}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  };
}