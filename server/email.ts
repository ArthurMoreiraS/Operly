import nodemailer from 'nodemailer';
import type { Lead } from '../shared/schema';

// Email configuration types
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Default admin email (can be overridden by env var)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@operly.com.br';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@operly.com.br';

// Create transporter based on environment
function createTransporter() {
  // In test environment, return null (will be mocked)
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  // Check if SMTP is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Email service not configured: SMTP_HOST, SMTP_USER, or SMTP_PASS missing');
    return null;
  }

  const config: EmailConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  return nodemailer.createTransport(config);
}

let transporter: nodemailer.Transporter | null = null;

// Initialize transporter lazily
function getTransporter() {
  if (transporter === null) {
    transporter = createTransporter();
  }
  return transporter;
}

// Send email function
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transport = getTransporter();
  
  if (!transport) {
    console.log('Email service not available, skipping email:', options.subject);
    return false;
  }

  try {
    await transport.sendMail({
      from: FROM_EMAIL,
      ...options,
    });
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Format lead for email
function formatLeadEmail(lead: Lead): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 12px; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .cta { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { margin-top: 20px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🎉 Novo Lead Recebido!</h1>
        </div>
        <div class="content">
          <p>Um novo lead acabou de se cadastrar na landing page:</p>
          
          <div class="field">
            <span class="label">Nome:</span>
            <span class="value">${lead.name}</span>
          </div>
          
          <div class="field">
            <span class="label">WhatsApp:</span>
            <span class="value">${lead.whatsapp}</span>
          </div>
          
          <div class="field">
            <span class="label">Email:</span>
            <span class="value">${lead.email}</span>
          </div>
          
          ${lead.teamSize ? `
          <div class="field">
            <span class="label">Tamanho da equipe:</span>
            <span class="value">${lead.teamSize}</span>
          </div>
          ` : ''}
          
          <div class="field">
            <span class="label">Data:</span>
            <span class="value">${new Date(lead.createdAt).toLocaleString('pt-BR')}</span>
          </div>
          
          <a href="${process.env.APP_URL || 'https://operly.com.br'}/admin/leads" class="cta">
            Ver no Painel Admin
          </a>
          
          <div class="footer">
            <p>Este email foi enviado automaticamente pelo sistema Operly.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
🎉 Novo Lead Recebido!

Um novo lead acabou de se cadastrar na landing page:

Nome: ${lead.name}
WhatsApp: ${lead.whatsapp}
Email: ${lead.email}
${lead.teamSize ? `Tamanho da equipe: ${lead.teamSize}` : ''}
Data: ${new Date(lead.createdAt).toLocaleString('pt-BR')}

Acesse o painel admin para mais detalhes: ${process.env.APP_URL || 'https://operly.com.br'}/admin/leads

---
Este email foi enviado automaticamente pelo sistema Operly.
  `.trim();

  return { html, text };
}

// Send new lead notification to admin
export async function sendNewLeadNotification(lead: Lead): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || ADMIN_EMAIL;
  const { html, text } = formatLeadEmail(lead);

  return sendEmail({
    to: adminEmail,
    subject: `🎉 Novo Lead: ${lead.name}`,
    html,
    text,
  });
}

// Export for testing
export const _testing = {
  formatLeadEmail,
  createTransporter,
  ADMIN_EMAIL,
  FROM_EMAIL,
};
