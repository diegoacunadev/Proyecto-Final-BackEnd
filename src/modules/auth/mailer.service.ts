import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly apiKey: string;
  private readonly fromEmail: string;
  private readonly appName: string;
  private readonly frontendUrl: string;

constructor(private readonly configService: ConfigService) {
  const apiKey = this.configService.get<string>('BREVO_API_KEY');
  if (!apiKey) {
    this.logger.error('❌ Falta la variable BREVO_API_KEY en el entorno');
    throw new Error('BREVO_API_KEY is missing');
  }

  this.apiKey = apiKey;
  this.fromEmail =
    this.configService.get<string>('EMAIL_FROM') ||
    'notificationsserviyapp@gmail.com';
  this.appName = this.configService.get<string>('APP_NAME') || 'ServiYApp';
  this.frontendUrl =
    this.configService.get<string>('FRONTEND_BASE_URL') ||
    'https://serviyapp.com';

  this.logger.log('Brevo inicializado correctamente');
}

  // --- Cargar plantilla HTML ---
  private loadTemplate(templateName: string): string {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'modules',
      'auth',
      'templates',
      `${templateName}.html`,
    );

    if (!fs.existsSync(templatePath)) {
      this.logger.warn(`No se encontró la plantilla: ${templatePath}`);
      return `<p>Hola {{name}}, bienvenido a {{appName}}</p>`;
    }

    return fs.readFileSync(templatePath, 'utf8');
  }

  // --- Reemplazar variables dinámicas ---
  private replaceVars(html: string, vars: Record<string, string>): string {
    for (const [key, val] of Object.entries(vars)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), val);
    }
    return html;
  }

  // --- Enviar correo genérico ---
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    fromName: string = this.appName,
  ): Promise<void> {
    try {
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { email: this.fromEmail, name: fromName },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(
        `Correo enviado a ${to} (ID: ${response.data?.messageId || 'sin ID'})`,
      );
    } catch (error) {
      this.logger.error(
        `Error enviando correo a ${to}: ${
          error.response?.data?.message || error.message
        }`,
      );
    }
  }

  // --- Correo de bienvenida al usuario ---
  async sendWelcomeUserMail(user: { names: string; email: string }) {
    const html = this.replaceVars(this.loadTemplate('welcome-user'), {
      name: user.names ?? '',
      appName: this.appName,
      frontend_url: this.frontendUrl,
    });

    await this.sendEmail(
      user.email,
      `¡Bienvenido a ${this.appName}!`,
      html,
      this.appName,
    );
  }

  // --- Correo de bienvenida al proveedor ---
  async sendWelcomeProviderMail(provider: { names: string; email: string }) {
    const html = this.replaceVars(this.loadTemplate('welcome-provider'), {
      name: provider.names ?? '',
      appName: this.appName,
      frontend_url: this.frontendUrl,
    });

    await this.sendEmail(
      provider.email,
      `Bienvenido a ${this.appName} Aliados`,
      html,
      `${this.appName} Aliados`,
    );
  }

  // --- Correo de recuperación de contraseña ---
  async sendPasswordResetMail(
    entity: { email: string; names?: string; surnames?: string },
    resetLink: string,
    type: 'user' | 'provider',
  ) {
    const fullName =
      [entity.names, entity.surnames].filter(Boolean).join(' ') ||
      (type === 'provider' ? 'Proveedor' : 'Usuario');

    const html = this.replaceVars(this.loadTemplate('reset-password'), {
      name: fullName,
      reset_link: resetLink,
      expiry_minutes: '15',
      appName: this.appName,
    });

    const subject =
      type === 'provider'
        ? `Recupera tu contraseña como proveedor — ${this.appName}`
        : `Recupera tu contraseña — ${this.appName}`;

    await this.sendEmail(entity.email, subject, html, `Soporte ${this.appName}`);
  }

  async sendPaymentSuccessMail(
    email: string,
    vars: {
      name: string;
      amount: string;
      currency: string;
      status: string;
      payment_method: string;
      payment_type: string;
      mp_payment_id: string;
      service_order_id: string;
    },
  ) {
    const html = this.replaceVars(this.loadTemplate('payment-success'), {
      ...vars,
      appName: this.appName,
    });

    await this.sendEmail(
      email,
      `Pago confirmado - ${this.appName}`,
      html,
      this.appName,
    );
  }

  async sendPaymentToProviderMail(
    email: string,
    vars: {
      provider_name: string;
      service_name: string;
      amount: string;
      currency: string;
      status: string;
      payment_method: string;
      mp_payment_id: string;
      service_order_id: string;
    },
  ) {
    const html = this.replaceVars(
      this.loadTemplate('payment-provider-notification'),
      {
        ...vars,
        appName: this.appName,
      }
    );

    await this.sendEmail(
      email,
      `Has recibido un nuevo pago - ${this.appName} Aliados`,
      html,
      `${this.appName} Aliados`,
    );
  }
}




// import * as fs from 'fs';
// import * as path from 'path';
// import * as nodemailer from 'nodemailer';
// import { Injectable, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { join } from 'path';

// @Injectable()
// export class MailerService {
//   private readonly logger = new Logger(MailerService.name);
//   private transporter: nodemailer.Transporter;

//   constructor(private readonly configService: ConfigService) {
//     const user = this.configService.get<string>('EMAIL_USER');
//     const pass = this.configService.get<string>('EMAIL_PASS');
//     const host = this.configService.get<string>('EMAIL_HOST') || 'smtp.gmail.com';
//     const port = this.configService.get<number>('EMAIL_PORT') || 587;

//     this.logger.log(`Configurando SMTP: ${user} @ ${host}:${port}`);

//     this.transporter = nodemailer.createTransport({
//       host,
//       port,
//       secure: false, // STARTTLS
//       auth: { user, pass },
//     });

//     this.transporter.verify((error, success) => {
//       if (error) {
//         this.logger.error('Error al conectar con SMTP:', error.message);
//       } else {
//         this.logger.log('Conexión SMTP establecida correctamente');
//       }
//     });
//   }

//   async sendWelcomeUserMail(user: { names: string; email: string }) {
//     try {
//       const templatePath = path.join(
//         process.cwd(),
//         'src',
//         'modules',
//         'auth',
//         'templates',
//         'welcome-user.html',
//       );
//       let html = fs.readFileSync(templatePath, 'utf-8');

//       html = html
//         .replace(/{{name}}/g, user.names ?? '')
//         .replace(/{{appName}}/g, String(this.configService.get('APP_NAME') ?? 'ServiYApp'))
//         .replace(/{{frontend_url}}/g, String(this.configService.get('FRONTEND_BASE_URL') ?? ''));

//       await this.transporter.sendMail({
//         from: `"${this.configService.get('APP_NAME')}" <${this.configService.get('EMAIL_USER')}>`,
//         to: user.email,
//         subject: `¡Bienvenido a ${this.configService.get('APP_NAME')}!`,
//         html,
//       });

//       this.logger.log(`Correo de bienvenida enviado a ${user.email}`);
//     } catch (error) {
//       this.logger.error(`Error enviando correo a ${user.email}: ${error.message}`);
//       throw error;
//     }
//   }


//   async sendPasswordResetMail(
//     entity: { email: string; names?: string; surnames?: string },
//     resetLink: string,
//     type: 'user' | 'provider',
//   ) {
//     const templatePath = join(process.cwd(), 'src', 'modules', 'auth', 'templates', 'reset-password.html');
//     let html = fs.readFileSync(templatePath, 'utf-8');

//     const fullName =
//       [entity.names, entity.surnames].filter(Boolean).join(' ') ||
//       (type === 'provider' ? 'Proveedor' : 'Usuario');

//     html = html
//       .replace(/{{name}}/g, fullName)
//       .replace(/{{reset_link}}/g, resetLink)
//       .replace(/{{expiry_minutes}}/g, '15')
//       .replace(/{{appName}}/g, String(process.env.APP_NAME ?? 'ServiYApp'));

//     return this.transporter.sendMail({
//       from: `"Soporte ${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
//       to: entity.email,
//       subject:
//         type === 'provider'
//           ? `Recupera tu contraseña como proveedor — ${process.env.APP_NAME}`
//           : `Recupera tu contraseña — ${process.env.APP_NAME}`,
//       html,
//     });
//   }

//   async sendWelcomeProviderMail(provider: { names: string; email: string }) {
//     const path = require('path');
//     const fs = require('fs');

//     const templatePath = path.join(process.cwd(), 'src', 'modules', 'auth', 'templates', 'welcome-provider.html');
//     let html = fs.readFileSync(templatePath, 'utf-8');

//     html = html
//       .replace(/{{name}}/g, provider.names)
//       .replace(/{{appName}}/g, process.env.APP_NAME ?? 'ServiYApp')
//       .replace(/{{frontend_url}}/g, process.env.FRONTEND_BASE_URL);

//     await this.transporter.sendMail({
//       from: `"${process.env.APP_NAME} Aliados" <${process.env.EMAIL_USER}>`,
//       to: provider.email,
//       subject: `Bienvenido a ${process.env.APP_NAME} Aliados`,
//       html,
//     });
//   }
// }

