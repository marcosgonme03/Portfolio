/**
 * PORTFOLIO BACKEND — server.js
 * Express + Nodemailer — Formulario de contacto
 */

'use strict';

require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');
const nodemailer  = require('nodemailer');

const app  = express();
const PORT = process.env.PORT || 3001;

/* ============================================================
   MIDDLEWARES
============================================================ */

// CORS — permite orígenes locales + los configurados en .env
//
// En producción (Render, Railway, etc.) define en variables de entorno:
//   ALLOWED_ORIGINS=https://marcosgonzalez.dev,https://www.marcosgonzalez.dev
// Soporta lista separada por comas para múltiples dominios.
const DEV_ORIGINS = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8080',
  'null', // file:// — cuando abres el HTML directamente en el navegador
];

const PROD_ORIGINS = (process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const ALL_ORIGINS = [...DEV_ORIGINS, ...PROD_ORIGINS];

app.use(cors({
  origin: (origin, callback) => {
    // Permite peticiones sin origen (ej: Postman, curl) y orígenes conocidos
    if (!origin || ALL_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS bloqueado para el origen: ${origin}`));
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// Confiar en proxy reverso (necesario en Render/Railway/Heroku para rate-limit por IP)
app.set('trust proxy', 1);

// Parsear JSON con límite de tamaño (evita payloads gigantes)
app.use(express.json({ limit: '10kb' }));

// Rate limiting — máximo 5 mensajes por IP cada 15 minutos
// Protege contra spam y abuso del formulario
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Inténtalo en 15 minutos.' },
});

/* ============================================================
   TRANSPORTER DE NODEMAILER (Gmail SMTP)
   Usa App Password — no la contraseña de cuenta real
============================================================ */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verificar conexión al arrancar
transporter.verify((err) => {
  if (err) {
    console.error('❌ Error al conectar con Gmail:', err.message);
    console.error('   Revisa GMAIL_USER y GMAIL_APP_PASSWORD en tu .env');
  } else {
    console.log('✅ Nodemailer conectado con Gmail correctamente');
  }
});

/* ============================================================
   UTILIDADES DE VALIDACIÓN
============================================================ */

/**
 * Sanitiza una cadena eliminando caracteres HTML peligrosos.
 * Evita XSS en el cuerpo del email.
 */
function sanitize(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function isValidEmail(email) {
  // RFC 5322 simplificado — suficiente para validación de servidor
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/* ============================================================
   RUTAS
============================================================ */

// Healthcheck — para verificar que el servidor está activo
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * POST /api/contact
 * Body: { name, email, message }
 * Envía un email a CONTACT_RECIPIENT con los datos del formulario
 */
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, message } = req.body;

  // ── Validación de entrada ──────────────────────────────────
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  const cleanName    = sanitize(String(name).trim());
  const cleanEmail   = sanitize(String(email).trim().toLowerCase());
  const cleanMessage = sanitize(String(message).trim());

  if (cleanName.length < 2 || cleanName.length > 100) {
    return res.status(400).json({ error: 'El nombre debe tener entre 2 y 100 caracteres.' });
  }

  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ error: 'El email no es válido.' });
  }

  if (cleanMessage.length < 10 || cleanMessage.length > 2000) {
    return res.status(400).json({ error: 'El mensaje debe tener entre 10 y 2000 caracteres.' });
  }

  // ── Construir el email ─────────────────────────────────────
  const mailOptions = {
    from: `"Portfolio de Marcos" <${process.env.GMAIL_USER}>`,
    to: process.env.CONTACT_RECIPIENT,
    replyTo: cleanEmail,   // Al responder, va directo al remitente
    subject: `📬 Nuevo mensaje de ${cleanName} — Portfolio`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; border-radius: 12px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ff6a00, #ff8c00); padding: 32px 40px;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">
            /MG — Nuevo mensaje de contacto
          </h1>
        </div>

        <!-- Body -->
        <div style="padding: 40px; border: 1px solid rgba(255,255,255,0.07); border-top: none; border-radius: 0 0 12px 12px;">
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.07); color: #a3a3a3; font-size: 13px; width: 80px; text-transform: uppercase; letter-spacing: 0.1em;">
                Nombre
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.07); font-weight: 600; font-size: 15px;">
                ${cleanName}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.07); color: #a3a3a3; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">
                Email
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.07);">
                <a href="mailto:${cleanEmail}" style="color: #ff6a00; text-decoration: none; font-size: 15px;">${cleanEmail}</a>
              </td>
            </tr>
          </table>

          <div style="margin-top: 32px;">
            <p style="color: #a3a3a3; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Mensaje</p>
            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 20px; font-size: 15px; line-height: 1.7; color: #f5f5f5; white-space: pre-wrap;">
              ${cleanMessage}
            </div>
          </div>

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.07);">
            <a href="mailto:${cleanEmail}" style="display: inline-block; background: #ff6a00; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 999px; text-decoration: none;">
              Responder a ${cleanName} →
            </a>
          </div>
        </div>

        <div style="padding: 20px 40px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            Recibido el ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    `,
    // Versión texto plano como fallback
    text: `
Nuevo mensaje de contacto — Portfolio Marcos González

Nombre: ${cleanName}
Email: ${cleanEmail}

Mensaje:
${cleanMessage}

—
Recibido el ${new Date().toLocaleString('es-ES')}
    `.trim(),
  };

  // ── Enviar ─────────────────────────────────────────────────
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️  Mensaje enviado de: ${cleanEmail} (${cleanName})`);
    return res.status(200).json({ ok: true, message: '¡Mensaje enviado correctamente!' });
  } catch (err) {
    console.error('❌ Error al enviar email:', err.message);
    return res.status(500).json({ error: 'Error al enviar el mensaje. Inténtalo más tarde.' });
  }
});

// Ruta 404 para endpoints inexistentes
app.use((_, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

/* ============================================================
   ARRANQUE
============================================================ */
app.listen(PORT, () => {
  console.log(`🚀 Backend portfolio arrancado en http://localhost:${PORT}`);
  console.log(`   Healthcheck: http://localhost:${PORT}/health`);
});
