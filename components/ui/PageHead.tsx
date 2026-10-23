export function PageHead({ eyebrow, title, lede }: { eyebrow: string; title: React.ReactNode; lede?: React.ReactNode }) {
  return (
    <header className="page-head">
      <div className="wrap">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display page-head__title">{title}</h1>
        {lede ? <p className="lede page-head__lede">{lede}</p> : null}
      </div>
    </header>
  );
}
