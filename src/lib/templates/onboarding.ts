export function getInvitationEmailTemplate(data: {
  shopName: string;
  staffName: string;
  role: string;
  email: string;
  tempPass: string;
  onboardingLink: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #1E40AF;">Welcome to ${data.shopName}!</h2>
      <p>Hello <strong>${data.staffName}</strong>,</p>
      <p>You have been invited to join <strong>${data.shopName}</strong> as a <strong>${data.role}</strong>.</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Your Login Credentials:</strong></p>
        <p style="margin: 5px 0;">Email: ${data.email}</p>
        <p style="margin: 5px 0;">Temporary Password: <code style="background: #e5e7eb; padding: 2px 4px; border-radius: 4px;">${data.tempPass}</code></p>
      </div>
      
      <p>To get started, you need to complete your onboarding process. Please click the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.onboardingLink}" style="background-color: #1E40AF; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">Onboard Now</a>
      </div>
      
      <p style="font-size: 12px; color: #6b7280;">This link will expire in 48 hours. Please change your password after your first login.</p>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
      <p style="font-size: 12px; color: #9ca3af; text-align: center;">Powered by BusinessConnect.bd</p>
    </div>
  `;
}
