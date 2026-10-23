# X Íntimo — loja online

Loja online da X Íntimo: interiores, pijamas, roupa térmica e meias. Next.js 16 (App Router),
React 19 e TypeScript. O CSS usa tokens próprios, sem framework de UI e sem bibliotecas de animação.

> **Estado atual: modo demonstração.** Ainda não há catálogo real. Os produtos, preços e stock
> mostrados são ilustrativos e o site avisa disso em todas as páginas (faixa superior e `noindex`).
> Ver [docs/LAUNCH.md](docs/LAUNCH.md).

## Correr localmente

```bash
npm install
npm run dev          # http://localhost:3000
```

| Comando | O que faz |
| --- | --- |
| `npm run build` / `npm start` | build e servidor de produção |
| `npm run typecheck` | TypeScript estrito |
| `npm run lint` | ESLint (config Next) |
| `npm test` | testes unitários (preços, portes, validação PT, pesquisa, webhook) |
| `npm run test:e2e` | Playwright: percurso de compra completo + axe (WCAG 2.2 AA), telemóvel e desktop. Requer `npm run build` antes. Num ambiente sem browsers do Playwright: `PW_CHROMIUM=/caminho/para/chrome npm run test:e2e` |
| `npm run check:launch` | lista o que falta configurar antes do lançamento |

## O que está implementado

- **Homepage editorial**: hero-gaveta (as quatro famílias como faixas de tecido que são
  navegação), novidades em mosaico, bloco "Noite", "Leia a peça" (etiqueta e tamanhos),
  díptico Interiores/Meias, índice tipográfico da Térmica, marcas, como comprar, loja física.
- **Catálogo**: loja, categorias, pesquisa (com sugestões instantâneas), filtros por público,
  tamanho, cor e marca (formulário GET que funciona sem JavaScript), ordenação, paginação e
  estados vazios.
- **Produto**: galeria por cor (com zoom), cor → tamanho → quantidade, stock por variante,
  guia de tamanhos em diálogo, etiqueta de composição com símbolos de conservação, informação
  de envio e devolução, barra de compra fixa no telemóvel e peças relacionadas.
- **Saco**: gaveta lateral e página completa, guardado no dispositivo e sincronizado entre separadores.
- **Checkout** numa página, com validação PT (código postal, NIF, telefone), portes por região
  (Continente/Madeira/Açores) e levantamento em loja. **Preços e stock são recalculados no servidor.**
- **Conclusão da encomenda**, com dois canais:
  - **WhatsApp** (o canal atual da loja): é gerada uma mensagem com o pedido completo. Nada é cobrado.
  - **Stripe Checkout** (pagamento online): só fica ativo com catálogo real, chaves Stripe e portes
    configurados. Inclui webhook com verificação de assinatura.
- Páginas Sobre, Contactos, Apoio (envios, trocas, pagamentos), Guia de tamanhos e páginas legais
  (minutas), 404 e erro.
- SEO: metadados por página, URLs canónicos, JSON-LD (Product, BreadcrumbList, WebSite, ClothingStore),
  sitemap e robots. Em modo demonstração tudo fica `noindex`.

## Onde editar

| O quê | Ficheiro |
| --- | --- |
| Dados da empresa, políticas, portes | `data/store.ts` |
| Catálogo real | `data/store-catalog.json` (formato em [docs/CATALOGO.md](docs/CATALOGO.md)) |
| Categorias, marcas, tabelas de tamanhos | `data/taxonomy.ts` |
| Cores, tipografia, espaçamentos | `styles/tokens.css` ([docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md)) |

O que ainda não está definido aparece no site como <code>por confirmar</code>, para nada ser inventado.

## Estrutura

```
app/            rotas (homepage, loja, produto, saco, checkout, encomenda, apoio, legal, API)
components/     layout, product, catalog, cart, checkout, home, ui
lib/commerce/   domínio: tipos, catálogo, preços/portes, validação, encomenda, Stripe, WhatsApp
data/           dados editáveis (empresa, taxonomia, catálogo real e de demonstração)
styles/         tokens, base, componentes, páginas
tests/          unit (Vitest) e e2e (Playwright + axe)
docs/           brief criativo, sistema de design, catálogo, lançamento
```
