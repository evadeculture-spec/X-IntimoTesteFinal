/**
 * Validação do checkout — partilhada entre cliente e servidor.
 * Mensagens em pt-PT, específicas e acionáveis.
 */

export interface CheckoutInput {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  delivery: "envio" | "levantamento";
  address: string;
  address2: string;
  postalCode: string;
  city: string;
  nif: string;
  notes: string;
  channel: "online" | "whatsapp";
  acceptTerms: boolean;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutInput, string>>;

export const EMPTY_CHECKOUT: CheckoutInput = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  delivery: "envio",
  address: "",
  address2: "",
  postalCode: "",
  city: "",
  nif: "",
  notes: "",
  channel: "whatsapp",
  acceptTerms: false,
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** NIF português: 9 dígitos com dígito de controlo (módulo 11). */
export function isValidNif(raw: string): boolean {
  const nif = raw.replace(/\s/g, "");
  if (!/^\d{9}$/.test(nif)) return false;
  if (!"1235689".includes(nif[0]!) && !["45", "70", "71", "72", "74", "75", "77", "78", "79", "90", "91", "98", "99"].includes(nif.slice(0, 2)))
    return false;
  const sum = [...nif.slice(0, 8)].reduce((s, d, i) => s + Number(d) * (9 - i), 0);
  const check = 11 - (sum % 11);
  return (check >= 10 ? 0 : check) === Number(nif[8]);
}

/** Telefone: PT (9 dígitos, começa por 2 ou 9) ou internacional com "+". */
export function normalizePhone(raw: string): string | null {
  const s = raw.replace(/[\s().-]/g, "");
  if (/^(\+351|00351)?[29]\d{8}$/.test(s)) return "+351" + s.slice(-9);
  if (/^\+\d{8,15}$/.test(s)) return s;
  return null;
}

/** Aceita "1000123" e devolve "1000-123". */
export function normalizePostalCode(raw: string): string {
  const d = raw.replace(/\D/g, "");
  return d.length === 7 ? `${d.slice(0, 4)}-${d.slice(4)}` : raw.trim();
}

export function validateCheckout(input: CheckoutInput): CheckoutErrors {
  const e: CheckoutErrors = {};
  if (!input.email.trim()) e.email = "Indique o seu email para receber a confirmação.";
  else if (!EMAIL.test(input.email.trim())) e.email = "Este email não parece completo — confirme, por exemplo, nome@exemplo.pt.";
  if (!input.phone.trim()) e.phone = "Indique um telefone para o caso de precisarmos de confirmar a entrega.";
  else if (!normalizePhone(input.phone)) e.phone = "Indique um número com 9 dígitos (ou o indicativo do país, com +).";
  if (!input.firstName.trim()) e.firstName = "Indique o seu nome.";
  if (!input.lastName.trim()) e.lastName = "Indique o seu apelido.";
  if (input.delivery === "envio") {
    if (!input.address.trim()) e.address = "Indique a morada de entrega.";
    const cp = normalizePostalCode(input.postalCode);
    if (!cp) e.postalCode = "Indique o código postal.";
    else if (!/^\d{4}-\d{3}$/.test(cp)) e.postalCode = "O código postal tem o formato 0000-000.";
    if (!input.city.trim()) e.city = "Indique a localidade.";
  }
  if (input.nif.trim() && !isValidNif(input.nif)) e.nif = "Este NIF não é válido. Confirme os 9 dígitos ou deixe em branco.";
  if (input.notes.length > 500) e.notes = "As observações têm um máximo de 500 caracteres.";
  if (!input.acceptTerms) e.acceptTerms = "Para continuar, aceite os Termos e Condições.";
  return e;
}
