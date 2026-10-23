# X Íntimo — Design brief (interno)

## 0. O que existe (auditoria)

- Este repositório (`X-IntimoTesteFinal`) estava vazio.
- Versão anterior (`evadeculture-spec/X-intimo`, Next.js 14): catálogo com
  pedido por WhatsApp, sem pagamentos, sem fotografias reais, sem dados reais
  de produto (o próprio código marca tudo como "dados de exemplo" / `PLACEHOLDER`).
- Ficou dessa versão, e foi mantido:
  - a identidade: **círculo tijolo + "X" em pincelada + "Intimo" em serifa**;
  - as marcas revendidas: **Pijamas Isa** e **Ysabel Mora** (e outras);
  - as quatro famílias: **pijamas, interiores, roupa térmica, meias**;
  - os públicos: mulher, homem, criança;
  - o canal que já funciona: **pedido por WhatsApp**.
- Não há plataforma de e-commerce, pagamentos, stock nem fotografias reais.
  Ver `docs/LAUNCH.md`.

## 1. Direção criativa — "A primeira camada"

A X Íntimo vende o que se veste primeiro: o interior, o pijama, a camada térmica,
a meia. Não é uma marca de lingerie de luxo. É uma loja de confiança que escolhe
bem e conhece os tamanhos de cor.

Território: **a gaveta bem arrumada e a etiqueta de composição.**

- **A gaveta.** A homepage abre com as quatro famílias como faixas de tecido
  dobrado e empilhado. Cada faixa tem a sua textura: canelado, flanela,
  favo térmico ou malha. Cada faixa é também uma ligação para a categoria, por
  isso o hero é logo o índice da loja e não um banner vazio.
- **A etiqueta.** A informação de produto (composição, cuidados, tamanhos,
  referência) usa a gramática das etiquetas cosidas na roupa. Tipografia mono,
  maiúsculas pequenas, filetes finos. É precisa, honesta e fácil de ler.
- **O desenho técnico.** Enquanto não há fotografia real, cada produto aparece
  como um *desenho técnico plano* (o "flat" da indústria da moda) sobre a
  amostra de tecido da sua cor. Não finge ser fotografia, não usa banco de
  imagens e mantém o catálogo coerente. Quando chegarem as fotos, substituem
  o desenho sem mexer no layout.

Perceção pretendida: *"conhecem o que vendem; é bonito sem ser pretensioso;
comprar aqui é fácil."*

## 2. Diferenciadores visuais

1. Hero-gaveta: faixas de tecido texturado que são navegação real.
2. Disco tijolo do logótipo usado como sinal: tamanho selecionado, contador do
   saco, carimbo das etiquetas.
3. Etiqueta de composição como componente de informação.
4. Cada família tem cor de tecido própria, o que dá ritmo à homepage sem
   repetir a mesma grelha de cartões.
5. Títulos editoriais grandes ao lado de dados de produto pequenos e exatos.

## 3. Tipografia

- **Newsreader** (serifa editorial, eixo óptico 6–72, itálico): títulos e voz
  da marca. É calorosa e europeia, não é a didone do "luxo".
- **Schibsted Grotesk** (grotesca de jornal nórdico): UI, preço, formulários.
- **IBM Plex Mono**: só para dados de etiqueta (composição, tamanhos, referências).
- Todas as fontes têm licença OFL e são auto-alojadas via `next/font`.

## 4. Cor

| Token | Uso | Hex |
| --- | --- | --- |
| `--algodao` | fundo | `#F7F3EC` |
| `--linho` | superfícies | `#ECE5D9` |
| `--carvao` | texto, linhas | `#1B1917` |
| `--tijolo` | marca, ação | `#B5341F` (contraste AA sobre algodão) |
| `--noite` | Pijamas | `#1E2638` |
| `--aveia` | Térmica | `#C9B79A` |
| `--rubi` | Meias | `#7A2230` |
| `--cha` | Interiores | `#E3C9BC` |

Não há gradientes "de IA", vidro fosco, blobs nem sombras decorativas. As
superfícies distinguem-se por cor e por filetes de 1px.

## 5. Imagem

- Fotografia real (a obter): luz natural, fundo de linho ou parede caiada,
  recortes apertados no tecido e no gesto. Sem poses sexualizadas e com
  diversidade real de corpos. Proporção de produto 4:5 e editorial 3:4 / 16:9.
- Até lá: desenhos técnicos sobre amostra de tecido, claramente a título de
  apresentação (ver `components/product/ProductPlate.tsx`).

## 6. Estratégia de compra

- Do hero às categorias num toque; a pesquisa está sempre à vista.
- Listagens renderizadas no servidor (SEO). Os filtros são formulário GET e
  funcionam sem JavaScript.
- Página de produto: cor → tamanho → adicionar. Não é possível adicionar sem
  tamanho; o erro é claro e anunciado ao leitor de ecrã.
- Saco em gaveta lateral (`<dialog>` nativo) e também em página completa.
- Checkout numa só página, com validação PT (código postal, NIF, telefone).
- Dois canais de conclusão, ambos honestos:
  - **Pagamento online (Stripe Checkout)**: só fica ativo com credenciais e
    catálogo real. Cartão, MB WAY e Multibanco são configurados no painel Stripe.
  - **Pedido com confirmação por WhatsApp**: o canal atual da loja. Não há
    pagamento e não se promete nada que não exista.

## 7. Técnica

- Next.js 16 (App Router), React 19, TypeScript estrito, CSS com tokens (sem
  framework de UI), zero bibliotecas de animação.
- Camada `lib/commerce`: tipos, adaptador de catálogo e regras de preços e portes.
  - `demo`: dados ilustrativos. Mostra uma faixa "modo demonstração" em todas as
    páginas, aplica `noindex` e desliga o pagamento online.
  - `store`: catálogo real em `data/store-catalog.json`.
- Os preços são sempre recalculados no servidor no checkout.
- Não há rastreadores, por isso não é preciso banner de cookies (o saco usa
  `localStorage`, que é estritamente necessário). Ver política de cookies.
