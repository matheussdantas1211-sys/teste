import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import qrcode from 'qrcode';
import pino from 'pino';
import { env } from '../config/env';
import { supabaseAdmin } from '../config/supabase';

const logger = pino({ level: 'silent' });
let socket: ReturnType<typeof makeWASocket> | null = null;
let qrCodeDataUrl: string | null = null;
let connectionStatus: 'CONECTADO' | 'DESCONECTADO' | 'CONECTANDO' = 'DESCONECTADO';

export async function ensureWhatsAppConnection() {
  const { state, saveCreds } = await useMultiFileAuthState(env.BAILEYS_SESSION_DIR);

  socket = makeWASocket({
    auth: state,
    logger,
    printQRInTerminal: false,
    syncFullHistory: false
  });

  connectionStatus = 'CONECTANDO';

  socket.ev.on('creds.update', saveCreds);
  socket.ev.on('connection.update', async (update) => {
    if (update.qr) {
      qrCodeDataUrl = await qrcode.toDataURL(update.qr);
    }

    if (update.connection === 'open') {
      connectionStatus = 'CONECTADO';
      qrCodeDataUrl = null;
    }

    if (update.connection === 'close') {
      connectionStatus = 'DESCONECTADO';
      const statusCode = (update.lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)?.output?.statusCode;

      if (statusCode !== DisconnectReason.loggedOut) {
        await ensureWhatsAppConnection();
      }
    }
  });
}

export async function getWhatsAppStatus() {
  return {
    status: connectionStatus,
    qrCodeDataUrl
  };
}

export async function sendBillingMessage(params: {
  tenantId: string;
  invoiceId: string;
  phone: string;
  customerName: string;
  template: string;
  message: string;
}) {
  if (!socket || connectionStatus !== 'CONECTADO') {
    throw new Error('WhatsApp não está conectado.');
  }

  await socket.sendMessage(`${params.phone}@s.whatsapp.net`, { text: params.message });

  await supabaseAdmin.from('whatsapp_logs').insert({
    tenant_id: params.tenantId,
    invoice_id: params.invoiceId,
    customer_name: params.customerName,
    phone: params.phone,
    template_name: params.template,
    status: 'ENVIADO',
    payload: { message: params.message }
  });
}
