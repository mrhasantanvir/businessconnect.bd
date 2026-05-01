export function getPasswordResetEmailTemplate(data: {
  userName: string;
  resetLink: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #1E40AF;">Password Reset Request</h2>
      <p>Hello <strong>${data.userName}</strong>,</p>
      <p>We received a request to reset your password for your BusinessConnect.bd account.</p>
      
      <p>If you made this request, please click the button below to set a new password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.resetLink}" style="background-color: #1E40AF; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
      </div>
      
      <p>This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">Powered by BusinessConnect.bd</p>
    </div>
  `;
}
