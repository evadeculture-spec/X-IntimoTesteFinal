"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

/**
 * <dialog> nativo em modo modal: foco preso, Esc fecha, foco devolvido ao
 * elemento que o abriu. Clique no fundo também fecha.
 */
export function Dialog({
  open,
  onClose,
  title,
  variant = "drawer",
  side = "end",
  children,
  footer,
  id,
  hideTitle,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  variant?: "drawer" | "sheet";
  side?: "start" | "end";
  children: ReactNode;
  footer?: ReactNode;
  id?: string;
  hideTitle?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = `${id ?? "dlg"}-title`;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      id={id}
      className={`${variant}${side === "start" ? " drawer--start" : ""}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {variant === "drawer" ? (
        <div className="panel">
          <div className="panel__head">
            <h2 id={titleId} className="panel__title">
              {title}
            </h2>
            <button type="button" className="icon-btn" onClick={onClose}>
              <Icon name="close" label="Fechar" />
            </button>
          </div>
          <div className="panel__body">{children}</div>
          {footer ? <div className="panel__foot">{footer}</div> : null}
        </div>
      ) : (
        <div className="wrap">
          <div className="panel__head" style={{ paddingInline: 0, borderBottom: 0 }}>
            <h2 id={titleId} className={hideTitle ? "visually-hidden" : "panel__title"}>
              {title}
            </h2>
            <button type="button" className="icon-btn" onClick={onClose} style={{ marginLeft: "auto" }}>
              <Icon name="close" label="Fechar" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
