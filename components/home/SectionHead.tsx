import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export function SectionHead({
  id,
  eyebrow,
  title,
  link,
}: {
  id: string;
  eyebrow?: string;
  title: React.ReactNode;
  link?: { href: string; label: string };
}) {
  return (
    <header className="section-head">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 id={id} className="display section-head__title">
          {title}
        </h2>
      </div>
      {link ? (
        <Link href={link.href} className="link-arrow">
          {link.label} <Icon name="arrow" className="icon icon--sm" />
        </Link>
      ) : null}
    </header>
  );
}
