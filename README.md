<div align="center">

# ✨ ShopSphere

**E-commerce Full Stack de artigos esportivos — React 19 + Express + Prisma**

SPA com animações GSAP/Framer Motion/Three.js · API REST em camadas · SQLite zero-config

`React 19` · `Vite` · `TypeScript` · `TailwindCSS` · `Express` · `Prisma` · `Zustand` · `TanStack Query`

</div>

---

## 📖 Visão geral

O **ShopSphere** é uma loja de artigos esportivos completa: vitrine cinematográfica com vídeo e cena 3D, catálogo com 60+ produtos em 11 esportes, carrinho persistente, checkout multi-etapas com pagamento simulado, área do cliente, e painel administrativo com dashboard, CRUD de produtos com upload e visão 360° de cada cliente.

**Monorepo com dois apps independentes:**

```
┌──────────────────────┐   Axios/JSON   ┌──────────────────────────┐  Prisma  ┌──────────┐
│  web/ — React SPA    │ ─────────────► │  server/ — Express API   │ ───────► │  SQLite  │
│  Vite + React Router │ ◄───────────── │  routes → zod → services │ ◄─────── │  12 tab. │
└──────────────────────┘                └──────────────────────────┘          └──────────┘
```

---

## 🏛️ Backend (`server/`)

### Arquitetura em camadas

Cada módulo de domínio (`src/modules/*`) segue o mesmo pipeline:

```
Request → Router → [rate-limit] → [auth middleware] → [zod validate] → Service → Prisma → Response
                                                                          │
                                                              ApiError ───┴──► error middleware
```

- **Routes** (`*.routes.ts`): apenas HTTP — extraem input, chamam o service, devolvem status. Zero regra de negócio.
- **Validação** (`validate.middleware.ts`): schemas Zod validam e **coergem** `body`/`query`/`params` antes do service. Um `ZodError` vira `400` com os campos inválidos automaticamente.
- **Services** (`*.service.ts`): toda a regra de negócio, sem conhecer HTTP. Lançam `ApiError` (classe com `statusCode` + factories `badRequest/unauthorized/notFound/conflict`).
- **Error middleware**: converte `ApiError`, `ZodError` e erros conhecidos do Prisma (`P2002` duplicado → 409, `P2025` não encontrado → 404) em respostas JSON consistentes; stack trace só em desenvolvimento.

### Autenticação — JWT com refresh rotativo

```
login/register ──► access token (15min) + refresh token (7d)
                        │                      │
                        ▼                      ▼
              Authorization: Bearer    bcrypt-hash salvo em users.refreshToken
                                               │
401 no cliente ──► POST /auth/refresh ─────────┤ compara hash; INVALIDA o antigo
                                               ▼ emite par novo (rotação)
```

- O refresh token é salvo **hasheado** (bcrypt) — vazamento do banco não expõe sessões vivas.
- Cada uso **rotaciona** o token: replay de um refresh antigo falha.
- Recuperação de senha: token aleatório (`crypto.randomBytes`) salvo como SHA-256 com validade de 30min; o link é impresso no console da API (projeto de portfólio, sem provedor de e-mail). Redefinir a senha invalida todas as sessões.
- Login protegido por `express-rate-limit` (10 tentativas / 15min).

### Estoque transacional

O estoque é a parte mais sensível do domínio; todas as mutações rodam em `prisma.$transaction`:

| Evento | Efeito |
|---|---|
| **Checkout** | decremento atômico com guarda: `updateMany({ where: { id, stock: { gte: qty } } })` — se `count === 0`, outro checkout levou o estoque e a transação inteira aborta. `sold` é incrementado junto. |
| **Cancelamento** (cliente ou admin) | itens voltam ao estoque (`stock +qty`, `sold -qty`) e o pagamento vira `REFUNDED`. |
| **Admin reativa pedido cancelado** | re-consome estoque com a mesma guarda — falha com 400 se acabou nesse meio-tempo. |

O cliente só pode cancelar enquanto o pedido não foi enviado (`PENDING/PAID/PROCESSING`). Preços e cupons são **sempre recalculados no servidor** — o total do cliente nunca é confiado.

### Pagamento e frete simulados

- **Gateway fake determinístico**: cartão terminando em `0000` → recusado (402); qualquer outro / PIX / boleto → aprovado, com `transactionId` e `paidAt`. O pedido nasce `PAID` com snapshot dos itens (título, imagem, preço no momento).
- **Frete** (`shipping.service.ts`): 3 modalidades com preço/prazo derivados do primeiro dígito do CEP (determinístico). **Grátis no Econômico acima de R$ 250** — a mesma constante exibida no site.

### Histórico de preço determinístico

`GET /products/:id/price-history?days=30|90|365` gera uma série sintética **estável entre chamadas**: ondas senoidais semeadas pelo hash do id do produto, com decaimento que converge para o preço atual. Retorna também `lowest90` e `isLowest` — combustível do selo *"menor preço dos últimos 90 dias"* no front.

### Upload de imagens com fallback

`POST /uploads` (admin, multipart via Multer em memória, máx. 5MB/6 arquivos):
1. **Cloudinary configurado?** → stream com `quality: auto`.
2. **Não?** → grava em `server/uploads/` com nome `uuid.ext` e serve via `express.static` (helmet ajustado com `crossOriginResourcePolicy: cross-origin` para a SPA em outra porta carregar as imagens).

### Banco de dados (Prisma + SQLite)

12 modelos: `User`, `Category` (auto-relação para hierarquia), `Product`, `CartItem`, `WishlistItem`, `Review`, `Coupon`, `Address`, `Order`, `OrderItem`, `Payment`, `NewsletterSubscriber`.

Decisões importantes:
- **Preços em centavos (`Int`)** — sem erro de ponto flutuante; formatação com `Intl.NumberFormat('pt-BR')` só na borda.
- **SQLite** para experiência clone-and-run. Como SQLite não tem enums nem arrays: campos enum-like são `String` validados por Zod na borda (unions em `src/types.ts`), e `images`/`tags` são `Json`. Para Postgres em produção: troque o provider, converta `Json → String[]` e strings → `enum`.
- **Denormalizações conscientes**: `Product.rating/reviewCount` (recalculados em transação a cada review) e `Product.sold` evitam agregações em toda listagem. `Order.shippingAddress` é snapshot `Json` — editar o endereço depois não reescreve a história.
- **Seed** (`prisma/seed.ts`): 11 categorias, ~62 produtos da linha fictícia "Sphere", 7 usuários, 3 cupons, reviews com agregados consistentes e 48 pedidos espalhados por 6 meses para alimentar os gráficos do dashboard.

### Endpoints principais

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/auth/register` `/login` `/refresh` `/logout` | — | Sessão com refresh rotativo |
| POST | `/api/auth/forgot-password` `/reset-password` | — | Recuperação de senha |
| GET | `/api/products` | — | Filtros: busca, categoria, preço, rating, estoque, promoção + 6 ordenações + paginação |
| GET | `/api/products/slug/:slug` (`/related`) | — | Detalhe + relacionados |
| GET | `/api/products/:id/price-history` | — | Série de preço simulada |
| POST | `/api/orders/shipping/quote` | — | Frete por CEP |
| POST | `/api/coupons/validate` | — | Valida cupom contra subtotal |
| POST | `/api/orders/checkout` | 🔒 | Compra transacional completa |
| POST | `/api/orders/mine/:id/cancel` | 🔒 | Cancela + devolve estoque |
| GET | `/api/users/:id` | 👑 | Cliente 360°: endereços + pedidos |
| GET | `/api/dashboard` | 👑 | Receita mensal, status, top produtos |
| POST | `/api/uploads` | 👑 | Imagens (Cloudinary ou disco local) |
| CRUD | `/api/products` `/categories` `/coupons` | 👑 | Gestão da loja |

🔒 = autenticado · 👑 = admin

---

## 🎨 Frontend (`web/`)

### Estado — quem guarda o quê

| Camada | Ferramenta | O que guarda |
|---|---|---|
| **Server state** | TanStack Query 5 | Produtos, pedidos, endereços, wishlist, dashboard. Query keys hierárquicas (`['products', filters]`, `['order', id]`) permitem invalidação cirúrgica: pós-checkout invalida `['products']` para o estoque atualizar em toda a loja. |
| **Client state persistido** | Zustand + `persist` | `cart-store` (itens, salvos para depois, cupom), `auth-store` (sessão), `recently-viewed-store`, tema. |
| **UI efêmera** | Zustand | drawers, busca Ctrl+K, toasts (store própria com API `toast.success/error/info`). |
| **Formulários** | React Hook Form + Zod | login, cadastro, endereço, produto — schema compartilha a linguagem de validação com o backend. |

### Client HTTP com refresh transparente

`lib/api.ts`: interceptor Axios anexa o access token; num `401`, dispara **um único** refresh compartilhado entre requisições concorrentes (`refreshPromise` deduplicada), regrava a sessão e repete a chamada original. Falhou? Sessão limpa, usuário deslogado.

### Camada de compatibilidade (o segredo da migração Next → Vite)

O app nasceu em Next.js e migrou para React puro trocando **apenas imports**, graças a três shims com API idêntica:
- `components/common/image.tsx` — `<img>` com `fill`/`priority`, lazy loading e **fallback automático em erro** (imagem quebrada nunca aparece);
- `components/common/link.tsx` — `href` → React Router `to`, com detecção de links externos;
- `lib/navigation.ts` — `useRouter`/`usePathname`/`useSearchParams` sobre o React Router.

### Animações — três motores, papéis distintos

| Motor | Onde | Por quê |
|---|---|---|
| **Framer Motion** | micro: reveals de cards/seções (`<Reveal>`), toasts, modais/drawers, transição de página, barra de scroll, navbar que se esconde ao rolar | API declarativa por componente |
| **GSAP + ScrollTrigger** | macro: parallax do hero (scrub), tipografia gigante horizontal, reveals em cascata e contadores da seção Sphere Lab | controle fino de timeline atrelada ao scroll |
| **Three.js (R3F + drei)** | assinatura visual: orb metálico distorcido que flutua e segue o mouse, com partículas | identidade — a "esfera" da marca |

`prefers-reduced-motion` é respeitado no marquee; `useGSAP` faz cleanup automático de ScrollTriggers na troca de rota.

### Performance

- **Code splitting real**: admin inteiro + Recharts (~400kB) e Three.js (~900kB) em chunks lazy que só baixam quando usados; o gráfico de preço também é `lazy()`. Bundle inicial ≈ 210kB gzip.
- `manualChunks` separa vendors estáveis (react, motion, charts) para cache de longo prazo.
- Imagens `loading="lazy"` por padrão (`priority` no hero), skeletons em toda espera, `keepPreviousData` na paginação.

### UX / A11y

Dark mode com detecção do SO (ThemeProvider próprio, classe no `<html>`, anti-flash no `index.html`) · navegação por teclado com focus ring visível · `aria-*` em galeria, stepper, filtros e paginação · empty/error states com ação · página 404, error boundary e manutenção · busca instantânea `Ctrl+K`.

---

## ⚙️ Funcionalidades

**Loja** — catálogo com filtros/ordenação/infinite scroll · galeria com zoom · **gráfico de preço (30d/90d/1a) com selo de menor preço em 90 dias** · **frete por CEP na página do produto** · **compre junto** (bundle com seleção) · social proof ("N pessoas vendo agora") · estoque ao vivo com badge de últimas unidades · vistos recentemente · compartilhar via **WhatsApp, QR Code e link** · avaliações com nota agregada

**Carrinho & Checkout** — carrinho persistente com **salvar para depois** · barra animada de progresso do frete grátis · cupom validado no servidor mostrando a economia · checkout em 3 etapas (endereço → frete → pagamento) · cartão/PIX/boleto simulados · **confete na confirmação** + previsão de entrega

**Conta** — pedidos com detalhe e **cancelamento** (estorno + devolução ao estoque) · endereços · favoritos · alterar senha

**Admin** — dashboard com gráficos de receita e status · CRUD de produtos com upload (Cloudinary ou local) · categorias · cupons · pedidos com mudança de status · **cliente 360°** (endereços, compras, previsão de entrega)

---

## 🚀 Como executar

**Pré-requisito:** Node.js 20+. Nada mais — o banco é SQLite embarcado.

```bash
npm install && npm install --prefix server && npm install --prefix web

cp server/.env.example server/.env
cp web/.env.example web/.env

npm run db:migrate   # cria server/prisma/dev.db
npm run db:seed      # 62 produtos, usuários, cupons, pedidos históricos

npm run dev          # API :3333 + Web :3000
```

| Credencial | Valor |
|---|---|
| Admin | `admin@shopsphere.dev` / `Admin@123` |
| Cliente | `ana@example.com` / `Cliente@123` |
| Cupons | `BEMVINDO10` (10%) · `SPHERE20` (20% ≥ R$200) · `VIP50` (R$50 ≥ R$300) |
| Cartão teste | 16 dígitos quaisquer aprova · final `0000` recusa |

**Scripts úteis:** `npm run dev:api` · `npm run dev:web` · `npm run build` · `npx prisma studio --prefix server`

---

## ☁️ Deploy

Guia completo em **[DEPLOY.md](DEPLOY.md)**: contas a criar (Neon, Render, Vercel,
Cloudinary, Resend), todas as variáveis de ambiente de cada serviço, conversão do
schema SQLite → PostgreSQL e checklist de troubleshooting.

## 🔮 Roadmap

- [ ] Testes (Vitest/Testing Library + Supertest) e CI
- [ ] Gamificação: missões, pontos, níveis (Bronze→Diamante) e cashback com extrato
- [ ] Wishlist pública/privada compartilhável
- [ ] Pagamentos reais: Stripe/Mercado Pago, Apple/Google Pay, parcelamento
- [ ] Reviews com fotos/vídeos, "compra verificada", votos de utilidade e resumo por IA
- [ ] Perguntas & respostas na página do produto
- [ ] Busca por voz e por imagem; correção automática de digitação
- [ ] Rastreamento de entrega em mapa; carrinho abandonado por e-mail
- [ ] Visualização 360° dos produtos; cursor personalizado
- [ ] i18n (idioma/moeda) e PWA offline
- [ ] SSR/SEO avançado (Next.js ou pré-render)

---

<div align="center">Feito com 💜 como peça central de portfólio Full Stack.</div>
