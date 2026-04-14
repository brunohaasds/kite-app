# PWA — instalação e service worker (eKite)

## O que foi implementado

- **Web App Manifest** — [`src/app/manifest.ts`](../../src/app/manifest.ts) (`/manifest.webmanifest`): nome, `start_url`, `display: standalone`, `theme_color` / `background_color`, ícones em [`public/icons/`](../../public/icons/) (`icon-192.png`, `icon-512.png`).
- **Metadata** — [`src/app/layout.tsx`](../../src/app/layout.tsx): `applicationName`, `appleWebApp`, `viewport.themeColor`, ícones locais para favicon / Apple.
- **Serwist (Turbopack)** — [`next.config.ts`](../../next.config.ts) com `withSerwist`; [`src/app/sw.ts`](../../src/app/sw.ts) usa `defaultCache` do pacote; [`src/app/serwist/[path]/route.ts`](../../src/app/serwist/[path]/route.ts) serve o bundle em `/serwist/sw.js`.
- **Registo do SW** — [`src/components/pwa/serwist-provider.tsx`](../../src/components/pwa/serwist-provider.tsx): `SerwistProvider` apenas em **`NODE_ENV === "production"`** (evita conflitos com HMR em dev).
- **Offline** — página [`/offline`](../../src/app/offline/page.tsx) e fallback de documento no SW; precache inclui `/offline` (revisão via git hash ou UUID em ambientes sem `.git`).
- **Middleware** — [`src/middleware.ts`](../../src/middleware.ts): rotas públicas `/serwist`, `/offline`, `/icons`, `/manifest.webmanifest` para o SW e assets não exigirem login.

## Verificação manual (QA)

Após deploy em **HTTPS**:

1. **Chrome (desktop ou Android)** — DevTools → Application → Manifest / Service Workers; ou menu **Instalar app**. Confirmar ícone e nome “eKite”.
2. **Safari iOS** — Partilhar → **Adicionar à página inicial**; abrir em ecrã completo.
3. **Offline** — Com app instalada, desligar rede e navegar para uma rota não em cache; deve aparecer fallback ou página `/offline` quando aplicável.

Em **`npm run dev`** o Serwist desativa precache manifest (comportamento da biblioteca); o comportamento completo aproxima-se do produção com `npm run build && npm start`.

## Dependências

- `serwist`, `@serwist/turbopack`, `esbuild` (dev) — ver [package.json](../../package.json).

## Limitações / fase 2

- Toast “nova versão disponível” + `skipWaiting` não está implementado.
- Ícones foram gerados para PWA; substituir por assets finais da marca se necessário.

**Última atualização:** 2026-04-14
