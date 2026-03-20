import { Resend } from 'npm:resend';

export const sendEmail = async (to: string, subject: string, html: string) => {
  const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
  
  try {
    const result = await resend.emails.send({
      from: 'CATI E&M CMS <onboarding@resend.dev>',
      to,
      subject,
      html
    });
    console.log('Email sent:', result);
    return { success: true };
  } catch (error) {
    console.error('Email failed:', error);
    return { success: false, error: error.message };
  }
};
