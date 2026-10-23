# Sistema de design — referência rápida

Tokens em `styles/tokens.css`. Componentes em `styles/components.css`, composições de página em `styles/pages.css`.

## Princípios
1. **Têxtil, não digital.** As superfícies distinguem-se por cor e por textura de tecido (canelado,
   flanela, favo, malha), nunca por sombras ou cartões arredondados.
2. **Etiqueta.** Os dados de produto usam mono em maiúsculas pequenas e filetes de 1px.
3. **Disco tijolo** (do logótipo) só como sinal: tamanho escolhido, contador do saco, carimbos (Novo, −%).
4. **Cantos retos** (2px no máximo). Círculos só para discos e amostras de cor.
5. **Contraste editorial:** títulos serifados grandes ao lado de informação pequena e exata.

## Tipografia
| Papel | Família | Uso |
| --- | --- | --- |
| Display | Newsreader 400 / itálico 300 | Títulos, voz da marca; o itálico marca a palavra-chave ("A primeira *camada.*") |
| Texto/UI | Schibsted Grotesk | Navegação, preço, formulários, corpo |
| Etiqueta | IBM Plex Mono 400/500 | Eyebrows, referências, composição, tamanhos |

Escala fluida `--t-2xs` → `--t-3xl` (clamp). As fontes são auto-alojadas via `next/font` e só se
carregam os cortes usados.

## Cor
Base: `--algodao` (fundo), `--linho` (superfícies), `--carvao` (texto). Marca: `--tijolo` (ação e disco).
Famílias: Pijamas `--noite`, Interiores `--cha`, Térmica `--aveia`, Meias `--rubi`.
Todas as combinações de texto foram verificadas com axe (WCAG AA).

## Movimento
`--d-fast` 140ms (estados), `--d-base` 240ms (gavetas, discos), `--d-slow` 560ms (revelações).
Só CSS. Com `prefers-reduced-motion` tudo é instantâneo. Não há scroll hijacking nem parallax.

## Componentes principais
`btn` (+ `--brand`, `--outline`, `--lg`, `--block`), `icon-btn`, `disc`, `stamp`, `chip`, `card`,
`plate-frame` + `ProductPlate` (desenho técnico), `FabricSwatch`, `picker`/`swatch`/`size`, `qty`,
`care-label`, `field`/`choice`/`check`, `notice`, `pending`, `summary`, `cart-line`, `accordion`,
`crumbs`, `table`, diálogos `drawer`/`sheet` (elemento `<dialog>` nativo).

## Imagem
- Produto 4:5; editorial 3:4 ou 16:9. Fundo neutro e luz natural, sem poses sexualizadas, com
  diversidade real de corpos.
- Sem fotografia, usar `ProductPlate`: desenho técnico plano sobre linho, no tecido e na cor da
  variante, com legenda de referência. Não se usam imagens de banco nem imagens geradas que
  pareçam produtos reais.
