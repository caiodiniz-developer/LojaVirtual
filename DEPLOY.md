# 🚀 Guia de Deploy — ShopSphere

Guia completo para colocar o projeto no ar: quais contas criar, quais variáveis de
ambiente configurar em cada serviço, e o que precisa mudar no código antes.

---

## ⚠️ Leia primeiro: o que precisa mudar antes de deployar

O projeto hoje roda **localmente** com SQLite e um servidor Express de processo longo.
Três coisas precisam ser ajustadas para produção:

| # | Situação hoje | O que fazer | Obrigatório? |
|---|---|---|---|
| 1 | Banco **SQLite** (arquivo local) | Migrar para **PostgreSQL** (Neon) — arquivos não persistem em cloud | ✅ Sim |
| 2 | **Express** de processo longo | Hospedar em **Render/Railway** (a Vercel é serverless e não mantém processo) | ✅ Sim |
| 3 | Upload de imagem grava em **disco local** | Configurar **Cloudinary** (o disco do container é efêmero) | ⚠️ Recomendado |
| 4 | Reset de senha **imprime no console** | Integrar **Resend** (ainda **não implementado** — ver seção 6) | ⭕ Opcional |

### Arquitetura de deploy

```
┌────────────────────┐        ┌──────────────────────┐       ┌─────────────────┐
│  VERCEL            │  HTTPS │  RENDER / RAILWAY    │Prisma │  NEON           │
│  web/ (SPA Vite)   │ ─────► │  server/ (Express)   │ ────► │  PostgreSQL     │
│  Site estático     │ ◄───── │  Processo longo      │ ◄──── │  Serverless     │
└────────────────────┘        └──────────┬───────────┘       └─────────────────┘
                                         │
                              ┌──────────┴───────────┐
                              │ CLOUDINARY (imagens) │
                              │ RESEND (e-mails)     │
                              └──────────────────────┘
```

> ❗ **Não tente hospedar o `server/` na Vercel** sem refatorar. A Vercel roda funções
> serverless (sem estado, sem processo persistente). O Express atual espera um servidor
> rodando continuamente.

---

## 1. Contas que você precisa criar

Todas têm plano gratuito suficiente para portfólio.

| Serviço | Para quê | Link | Obrigatório |
|---|---|---|---|
| **Neon** | Banco PostgreSQL | [neon.tech](https://neon.tech) | ✅ Sim |
| **Render** | Hospedar a API | [render.com](https://render.com) | ✅ Sim |
| **Vercel** | Hospedar o site | [vercel.com](https://vercel.com) | ✅ Sim |
| **Cloudinary** | Upload de imagens | [cloudinary.com](https://cloudinary.com) | ⚠️ Recomendado |
| **Resend** | E-mails transacionais | [resend.com](https://resend.com) | ⭕ Opcional |

---

## 2. Variáveis de ambiente — referência completa

### 2.1 🖥️ Backend (Render) — `server/`

Todas validadas por Zod em `server/src/config/env.ts`. Se faltar uma obrigatória, a API
**não sobe** e loga o erro.

| Variável | Obrigatória | Exemplo / Valor | Onde obter |
|---|---|---|---|
| `DATABASE_URL` | ✅ | `postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require` | Neon → Dashboard → Connection String |
| `JWT_ACCESS_SECRET` | ✅ | string aleatória de 64 chars | Gere você (ver abaixo) |
| `JWT_REFRESH_SECRET` | ✅ | string aleatória **diferente** da anterior | Gere você (ver abaixo) |
| `CLIENT_URL` | ✅ | `https://seu-site.vercel.app` | URL do seu front na Vercel |
| `NODE_ENV` | ⚠️ | `production` | Fixo |
| `PORT` | ⭕ | `3333` | O Render injeta automaticamente — pode omitir |
| `JWT_ACCESS_EXPIRES` | ⭕ | `15m` (padrão) | Fixo |
| `JWT_REFRESH_EXPIRES` | ⭕ | `7d` (padrão) | Fixo |
| `CLOUDINARY_CLOUD_NAME` | ⭕ | `dxxxxxxx` | Cloudinary → Dashboard |
| `CLOUDINARY_API_KEY` | ⭕ | `123456789012345` | Cloudinary → Dashboard |
| `CLOUDINARY_API_SECRET` | ⭕ | `abcXYZ...` | Cloudinary → Dashboard |

> 🔐 As 3 variáveis do Cloudinary funcionam em conjunto: se as três estiverem
> preenchidas, o upload vai para o Cloudinary; se faltar qualquer uma, cai no
> fallback de disco local (que **se perde** a cada deploy no Render).

**Gerando os segredos JWT** (rode no seu terminal):

```bash
# PowerShell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Max 256 }))

# Git Bash / Linux / Mac
openssl rand -base64 48
```

Rode **duas vezes** — um valor para `JWT_ACCESS_SECRET`, outro para `JWT_REFRESH_SECRET`.
Nunca reutilize o mesmo valor nos dois.

### 2.2 🌐 Frontend (Vercel) — `web/`

O Vite só expõe variáveis com prefixo `VITE_`.

| Variável | Obrigatória | Exemplo | Observação |
|---|---|---|---|
| `VITE_API_URL` | ✅ | `https://shopsphere-api.onrender.com/api` | **Precisa terminar em `/api`** |

> ⚠️ Erro mais comum: esquecer o `/api` no final. O front monta as rotas como
> `${VITE_API_URL}/products`, então sem o sufixo tudo dá 404.

### 2.3 📧 Resend (quando você implementar)

Variáveis que **você adicionará** ao Render junto com o código da seção 6:

| Variável | Exemplo | Onde obter |
|---|---|---|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxxxxx` | Resend → API Keys → Create |
| `RESEND_FROM` | `ShopSphere <onboarding@resend.dev>` | Use `onboarding@resend.dev` para testar |

> No plano grátis sem domínio verificado, o Resend **só envia para o e-mail da sua
> própria conta**. Para enviar a qualquer destinatário, verifique um domínio em
> Resend → Domains (precisa de um domínio próprio + registros DNS).

---

## 3. Passo a passo do deploy

### Passo 1 — Criar o banco no Neon

1. Crie o projeto em [neon.tech](https://neon.tech) (região mais próxima, ex.: `AWS us-east-1`).
2. Copie a **Connection string** (formato `postgresql://...?sslmode=require`).
3. Guarde — é o seu `DATABASE_URL`.

### Passo 2 — Converter o schema para PostgreSQL

O SQLite não tem enums nem arrays; o Postgres tem. Edite `server/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"   // era "sqlite"
  url      = env("DATABASE_URL")
}
```

E converta os campos que foram adaptados para SQLite:

| Model.campo | Hoje (SQLite) | Vira (Postgres) |
|---|---|---|
| `Product.images` / `Product.tags` | `Json` | `String[]` |
| `Review.images` | `Json @default("[]")` | `String[]` |
| `User.role` | `String @default("CUSTOMER")` | `Role @default(CUSTOMER)` |
| `Order.status` | `String @default("PENDING")` | `OrderStatus @default(PENDING)` |
| `Payment.method` / `.status` | `String` | `PaymentMethod` / `PaymentStatus` |
| `Coupon.type` | `String` | `DiscountType` |
| `PointsEntry.reason`, `Notification.type` | `String` | pode manter `String` |

E declare os enums (as uniões já existem em `server/src/types.ts`):

```prisma
enum Role { CUSTOMER ADMIN }
enum OrderStatus { PENDING PAID PROCESSING SHIPPED DELIVERED CANCELLED }
enum PaymentMethod { CREDIT_CARD PIX BOLETO }
enum PaymentStatus { PENDING APPROVED DECLINED REFUNDED }
enum DiscountType { PERCENTAGE FIXED }
```

Depois, apague a pasta `server/prisma/migrations/` e gere a migração limpa do Postgres:

```bash
cd server
# aponte o .env local para o Neon temporariamente
npx prisma migrate dev --name init
npx tsx prisma/seed.ts     # popula o banco de produção com o catálogo
```

> 💡 Se der erro de tipo no `tsc` após a conversão, é porque o código faz cast de
> `images as string[]` (necessário no SQLite). Com `String[]` no Postgres esses casts
> viram redundantes, mas não quebram.

### Passo 3 — Deploy da API no Render

1. Render → **New** → **Web Service** → conecte o repositório do GitHub.
2. Configure:

| Campo | Valor |
|---|---|
| **Root Directory** | `server` |
| **Runtime** | Node |
| **Build Command** | `npm install && npx prisma generate && npm run build` |
| **Start Command** | `npx prisma migrate deploy && npm start` |
| **Instance Type** | Free |

3. Em **Environment**, adicione todas as variáveis da seção 2.1.
4. Deploy. Anote a URL gerada (ex.: `https://shopsphere-api.onrender.com`).
5. Teste: acesse `https://sua-api.onrender.com/health` → deve retornar `{"status":"ok"}`.

> ⏰ O plano free do Render **hiberna após 15 min** de inatividade. A primeira
> requisição depois disso demora ~50s. Normal para portfólio — mencione no README
> principal para quem for testar não achar que está quebrado.

### Passo 4 — Deploy do site na Vercel

1. Vercel → **Add New** → **Project** → importe o repositório.
2. Configure:

| Campo | Valor |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `web` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

3. Em **Environment Variables**, adicione:
   - `VITE_API_URL` = `https://sua-api.onrender.com/api`
4. Deploy.

**Rewrite obrigatório para SPA.** Sem isso, recarregar `/products` dá 404 (a Vercel
procura um arquivo nesse caminho). Crie `web/vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Passo 5 — Fechar o círculo do CORS

Volte no Render e ajuste `CLIENT_URL` para a URL real da Vercel
(ex.: `https://shopsphere.vercel.app`), sem barra no final. O backend usa essa
variável no CORS (`server/src/app.ts`) — se estiver errada, o navegador bloqueia
todas as chamadas.

---

## 4. Cloudinary (upload de imagens)

Sem Cloudinary, as imagens que o admin sobe vão para o disco do container do Render e
**somem no próximo deploy**.

1. Crie a conta em [cloudinary.com](https://cloudinary.com).
2. No Dashboard, copie **Cloud Name**, **API Key** e **API Secret**.
3. Adicione as 3 variáveis no Render (seção 2.1) e faça redeploy.

Nada muda no código — `server/src/modules/uploads/upload.routes.ts` já detecta as
credenciais e troca de estratégia sozinho.

---

## 5. Checklist de variáveis

**Render (API):**
```
DATABASE_URL=postgresql://...neon.tech/...?sslmode=require
JWT_ACCESS_SECRET=<openssl rand -base64 48>
JWT_REFRESH_SECRET=<outro openssl rand -base64 48>
CLIENT_URL=https://seu-site.vercel.app
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Vercel (site):**
```
VITE_API_URL=https://sua-api.onrender.com/api
```

---

## 6. Resend — e-mails transacionais (ainda não implementado)

> 🚧 **Status: não está no código.** Hoje o link de recuperação de senha é impresso no
> console da API (`server/src/modules/auth/auth.service.ts`). Abaixo está o passo a passo
> para plugar o Resend quando quiser.

### 6.1 Criar a conta e a API key

1. Crie a conta em [resend.com](https://resend.com).
2. **API Keys** → **Create API Key** → permissão *Sending access* → copie (`re_...`).
3. Para enviar a qualquer destinatário, vá em **Domains** → **Add Domain** e configure
   os registros DNS (SPF/DKIM). Sem domínio, use o remetente de teste
   `onboarding@resend.dev` — que só entrega no e-mail da sua conta.

### 6.2 Instalar e configurar

```bash
cd server
npm install resend
```

Adicione ao `server/src/config/env.ts`, dentro do `envSchema`:

```ts
RESEND_API_KEY: z.string().optional(),
RESEND_FROM: z.string().default('ShopSphere <onboarding@resend.dev>'),
```

E logo abaixo do `isCloudinaryConfigured`:

```ts
export const isResendConfigured = Boolean(env.RESEND_API_KEY);
```

### 6.3 Criar o serviço de e-mail

`server/src/lib/mailer.ts`:

```ts
import { Resend } from 'resend';
import { env, isResendConfigured } from '../config/env';

const resend = isResendConfigured ? new Resend(env.RESEND_API_KEY) : null;

/** Sends an e-mail when Resend is configured; logs to the console otherwise. */
export async function sendMail(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`📧 [dev] Para: ${to} | ${subject}`);
    return;
  }
  await resend.emails.send({ from: env.RESEND_FROM, to, subject, html });
}
```

### 6.4 Usar na recuperação de senha

Em `server/src/modules/auth/auth.service.ts`, no método `forgotPassword`, substitua o
`console.log` do link por:

```ts
const link = `${env.CLIENT_URL}/reset-password?token=${token}`;
await sendMail(
  user.email,
  'Redefinir sua senha — ShopSphere',
  `<p>Olá, ${user.name}!</p>
   <p>Clique no botão abaixo para criar uma nova senha. O link expira em 30 minutos.</p>
   <p><a href="${link}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Redefinir senha</a></p>
   <p>Se você não pediu isso, ignore este e-mail.</p>`
);
```

Os mesmos `sendMail(...)` podem ser chamados em `order.service.ts` (confirmação de
pedido) e em `fireStockAlerts` de `product.service.ts` (item de volta ao estoque) —
os dois pontos já têm o `console.log` no lugar certo para trocar.

### 6.5 Adicionar no Render

```
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM=ShopSphere <onboarding@resend.dev>
```

---

## 7. Depois do deploy

1. Acesse `https://seu-site.vercel.app` e confirme que os produtos carregam.
2. Entre com `admin@shopsphere.dev` / `Admin@123` e **troque a senha do admin
   imediatamente** (os dados vêm do seed público).
3. Teste o fluxo completo: cadastro → produto → carrinho → cupom → checkout.
4. Suba uma imagem pelo admin para validar o Cloudinary.

### Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Tudo dá 404 nas chamadas | Faltou `/api` no fim do `VITE_API_URL` |
| Erro de CORS no console | `CLIENT_URL` no Render não bate com a URL da Vercel (ou tem `/` no fim) |
| Recarregar `/products` dá 404 | Faltou o `web/vercel.json` com o rewrite |
| API não sobe, log de env inválida | Falta `DATABASE_URL` ou um dos `JWT_*_SECRET` |
| Primeira chamada demora ~50s | Render free hibernando — comportamento esperado |
| Imagens somem após deploy | Cloudinary não configurado (caiu no disco efêmero) |
| `the URL must start with postgresql://` | Schema ainda está com `provider = "sqlite"` |

---

## 8. Alternativas de hospedagem

| Serviço | Free tier | Hiberna? | Observação |
|---|---|---|---|
| **Render** | Sim | Sim (15 min) | Mais simples; usado neste guia |
| **Railway** | $5 de crédito/mês | Não | Melhor experiência, crédito acaba |
| **Fly.io** | Sim | Configurável | Mais controle, setup mais técnico |

Para o banco, **Neon** e **Supabase** são equivalentes — ambos Postgres gerenciado com
plano grátis.
