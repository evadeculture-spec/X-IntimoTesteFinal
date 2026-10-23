"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { CartLine } from "@/lib/commerce/types";
import { plural } from "@/lib/commerce/format";

const KEY = "xi:saco:v1";

interface CartContextValue {
  lines: CartLine[];
  ready: boolean;
  count: number;
  subtotal: number;
  add: (line: CartLine) => void;
  setQuantity: (sku: string, qty: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  bump: number;
  announce: (msg: string) => void;
  /** Limite de portes grátis configurado (Continente), ou null. */
  freeShippingFrom: number | null;
}

const CartContext = createContext<CartContextValue | null>(null);

function read(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as CartLine[]) : [];
    return Array.isArray(parsed) ? parsed.filter((l) => l && typeof l.sku === "string" && l.quantity > 0) : [];
  } catch {
    return [];
  }
}

function write(lines: CartLine[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* armazenamento indisponível (modo privado): o saco vive só nesta sessão */
  }
}

export function CartProvider({ children, freeShippingFrom = null }: { children: ReactNode; freeShippingFrom?: number | null }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const [message, setMessage] = useState("");
  const skipWrite = useRef(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratação a partir do localStorage
    setLines(read());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        skipWrite.current = true;
        setLines(read());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (skipWrite.current) {
      skipWrite.current = false;
      return;
    }
    write(lines);
  }, [lines, ready]);

  const announce = useCallback((msg: string) => {
    // Reinicia para que leitores de ecrã anunciem mensagens repetidas.
    setMessage("");
    window.setTimeout(() => setMessage(msg), 60);
  }, []);

  const add = useCallback(
    (line: CartLine) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.sku === line.sku);
        if (existing) {
          return prev.map((l) =>
            l.sku === line.sku ? { ...l, ...line, quantity: Math.min(line.max, l.quantity + line.quantity) } : l,
          );
        }
        return [...prev, line];
      });
      setBump((b) => b + 1);
      announce(`${line.name}, ${line.colourName}, tamanho ${line.size}, adicionado ao saco.`);
    },
    [announce],
  );

  const setQuantity = useCallback((sku: string, qty: number) => {
    setLines((prev) => prev.map((l) => (l.sku === sku ? { ...l, quantity: Math.max(1, Math.min(l.max, qty)) } : l)));
  }, []);

  const remove = useCallback(
    (sku: string) => {
      setLines((prev) => {
        const line = prev.find((l) => l.sku === sku);
        if (line) announce(`${line.name} removido do saco.`);
        return prev.filter((l) => l.sku !== sku);
      });
    },
    [announce],
  );

  const clear = useCallback(() => setLines([]), []);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((s, l) => s + l.quantity, 0);
    const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
    return { lines, ready, count, subtotal, add, setQuantity, remove, clear, isOpen, open, close, bump, announce, freeShippingFrom };
  }, [lines, ready, add, setQuantity, remove, clear, isOpen, open, close, bump, announce, freeShippingFrom]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {message}
      </div>
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}

export function bagLabel(count: number) {
  return count ? `Saco de compras, ${plural(count, "artigo", "artigos")}` : "Saco de compras, vazio";
}
