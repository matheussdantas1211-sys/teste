import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rota Segura SaaS',
  description: 'SaaS B2B de rastreamento veicular com cobrança, CRM e automação WhatsApp.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
