# SaaS de Rastreamento Veicular

Monorepo com frontend Next.js, backend Express, integração Supabase e automação de cobrança via WhatsApp para uma operação B2B de rastreamento veicular.

## Estrutura

- `apps/web`: painel administrativo em Next.js App Router.
- `apps/api`: API Express com JWT, multi-tenancy e motor de cobrança.
- `supabase/schema.sql`: schema completo do banco, índices, policies, seeds e automações SQL.

## Rodando localmente

```bash
cp .env.example .env
npm install
npm run dev:api
npm run dev:web
```

## Principais capacidades

- Dashboard com KPIs financeiros, operacionais e visão de fila de comandos.
- CRM de clientes com histórico financeiro, contatos secundários e health score.
- Gestão de veículos, rastreadores, chips M2M, ordens de serviço e operação técnica.
- Contratos recorrentes, emissão de faturas, baixa manual, webhook, renegociação e cobrança escalonada.
- Central de cobrança por WhatsApp usando Baileys.
- Configurações por tenant com regras profissionais de carência, multa, juros, reativação e automações operacionais.
- Banco desenhado para multi-tenancy, auditoria, fila de comandos remotos e escalabilidade.
