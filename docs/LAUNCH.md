# Lançamento — o que falta e como fazer

Corra `npm run check:launch` a qualquer momento: lista os bloqueios e os avisos que faltam resolver.

## 1. Informação que só a loja pode dar

| O quê | Onde | Porquê |
| --- | --- | --- |
| Denominação social, NIPC, morada, email, telefone, horário | `data/store.ts` → `BUSINESS` | Identificação obrigatória do vendedor (DL 7/2004, DL 24/2014) |
| Número de WhatsApp | `WHATSAPP_NUMBER` ou `BUSINESS.whatsapp` | Canal de encomenda |
| Prazo de devolução, quem paga os portes de devolução, regra de higiene | `data/store.ts` → `POLICIES` | Informação pré-contratual |
| Prazo de envio | `POLICIES.dispatchTime` | Informação pré-contratual |
| Tabela de portes real | `data/store.ts` → `SHIPPING_METHODS` | Totais corretos no checkout |
| Entidade RAL competente | `BUSINESS.ralEntity` | Lei 144/2015 (depende da localização) |
| História verdadeira da loja | `app/sobre/page.tsx` | Não foi inventada |
| Logótipo final em vetor | `components/layout/Logo.tsx`, `app/icon.svg` | O atual foi redesenhado a partir da versão anterior |

## 2. Catálogo e fotografia

1. Preencher `data/store-catalog.json` com os produtos reais (ver `docs/CATALOGO.md`).
2. Confirmar as tabelas de tamanhos com as fichas das marcas (`data/taxonomy.ts`) e passar `verified: true`.
3. Fotografias (recomendado): produto em 4:5, fundo de linho ou parede clara, luz natural.
   Enquanto não existirem, o site mostra desenhos técnicos (identificados como ilustrativos).
4. Quando o catálogo real tiver produtos, o modo demonstração desliga-se sozinho: a faixa de
   aviso desaparece e o site passa a ser indexável. Para forçar, definir `COMMERCE_CATALOG=store`.

## 3. Pagamento online (opcional, recomendado)

Sem Stripe, a loja funciona com encomendas por WhatsApp, o processo que já usa hoje.

1. Criar conta em stripe.com com os dados da empresa.
2. No painel, ativar os métodos de pagamento (**Cartão, MB WAY, Multibanco**, conforme disponível
   para a conta). O código não fixa métodos: usa os que estiverem ativos no painel.
3. Definir `STRIPE_SECRET_KEY` (começar com `sk_test_…`).
4. Criar o webhook `https://<domínio>/api/stripe/webhook` com os eventos
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed` e `checkout.session.expired`.
   Copiar o segredo para `STRIPE_WEBHOOK_SECRET`.
5. Preencher `SHIPPING_METHODS`. O pagamento online só fica ativo com portes configurados.
6. Testar com cartões de teste da Stripe e só depois mudar para `sk_live_…`.

> **Ponto de integração por fazer:** o webhook verifica a assinatura e regista o evento, mas ainda
> não grava a encomenda numa base de dados, não envia email à loja e não baixa o stock (ver
> `app/api/stripe/webhook/route.ts`). Até lá, as encomendas pagas consultam-se no painel Stripe.
> Para stock em tempo real é preciso um backend (por exemplo Supabase) ou uma plataforma de
> e-commerce.

## 4. Legal e privacidade

- As páginas `app/legal/*` são **minutas** baseadas no DL 24/2014, DL 84/2021, RGPD e Lei 144/2015.
  Têm de ser revistas por um jurista. Depois, retirar o aviso "Minuta em revisão".
- Faturação: confirmar com o contabilista como serão emitidas as faturas (software certificado AT).
- Cookies: o site não usa rastreadores, por isso não precisa de banner. Se forem adicionadas
  ferramentas de análise ou marketing, é obrigatório um banner de consentimento **antes** de as ativar.

## 5. Publicar (Vercel)

1. Fazer push do repositório para o GitHub.
2. Em vercel.com → Add New Project → importar o repositório (Next.js é detetado automaticamente).
3. Definir as variáveis de ambiente (ver `.env.example`) em Production.
4. Deploy. Associar o domínio e definir `NEXT_PUBLIC_SITE_URL` com o domínio final.
5. Verificar: `npm run check:launch` sem bloqueios, compra de teste ponta a ponta, `/sitemap.xml`,
   e registar o site na Google Search Console.

## Limitações conhecidas

- Sem contas de cliente: comprar não exige registo. Pode ser adicionado mais tarde.
- Stock estático (JSON), sem baixa automática ao vender.
- O pedido por WhatsApp depende de o cliente enviar a mensagem. A confirmação mostra a mensagem
  e permite copiá-la.
- Valores de Core Web Vitals medidos em laboratório (Lighthouse, telemóvel simulado em 4G lento).
  É preciso confirmá-los com dados reais depois do lançamento.
