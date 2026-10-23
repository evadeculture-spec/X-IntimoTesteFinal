# Catálogo real — formato

O catálogo real fica em `data/store-catalog.json` (`{ "products": [ … ] }`). Cada produto segue o
tipo `Product` de `lib/commerce/types.ts`. O ficheiro é validado no build: se houver erros, o
build falha com a lista do que corrigir, em vez de publicar dados errados.

```json
{
  "slug": "pijama-algodao-riscas-mulher",
  "ref": "ISA-12345",
  "name": "Pijama de algodão às riscas",
  "brandId": "isa",
  "categoryId": "pijamas",
  "audience": "mulher",
  "garment": "pijama",
  "weave": "malha",
  "price": 2990,
  "summary": "Uma frase curta.",
  "description": "Descrição completa.",
  "composition": ["100% algodão"],
  "care": ["lavar-40", "nao-lixivia", "secar-baixa", "passar-media", "nao-limpeza-seco"],
  "fit": "Opcional: como veste.",
  "details": ["Opcional", "Lista de detalhes"],
  "colours": [{ "id": "azul-noite", "name": "Azul-noite", "hex": "#26304A", "family": "azul" }],
  "sizes": ["S", "M", "L", "XL"],
  "variants": [{ "sku": "ISA-12345-AZ-S", "colourId": "azul-noite", "size": "S", "stock": 4 }],
  "sizeChartId": "mulher",
  "images": [{ "src": "/produtos/isa-12345-azul-1.jpg", "alt": "Pijama às riscas azul-noite, camisa e calça", "width": 1600, "height": 2000, "colourId": "azul-noite" }],
  "isNew": true,
  "publishedAt": "2026-10-10"
}
```

Regras:
- `price` e `compareAtPrice` são **cêntimos inteiros** (29,90 € = `2990`). Use `compareAtPrice`
  apenas para reduções reais (tem de ser maior que `price`).
- `stock`: número de unidades, ou `null` se o stock não for controlado. Nesse caso o site mostra
  "disponibilidade confirmada na encomenda".
- `garment` e `weave` escolhem o desenho técnico e a textura usados enquanto não há fotografia.
  Valores possíveis em `lib/commerce/types.ts`.
- `care`: códigos de símbolos de conservação. Copiar da etiqueta real da peça.
- Fotografias: colocar em `public/produtos/`, em formato 4:5 (ex.: 1600×2000), com fundo
  neutro. O Next.js gera AVIF/WebP e os tamanhos responsivos automaticamente.

## Quando o catálogo crescer

O ficheiro JSON serve bem para dezenas de produtos geridos à mão, mas o stock não baixa
sozinho com as vendas. Para inventário em tempo real, a camada `lib/commerce/catalog.ts` está
preparada para trocar a fonte (por exemplo uma base de dados ou uma plataforma de e-commerce
headless) sem mexer nas páginas.
