import React from "react";

/**
 * Editorial primitives for the long-form pages (about, impact, corporate,
 * vendor, policy).
 *
 * These pages previously rendered every section as an identical white card,
 * so a policy clause, a founding story and a pricing table all carried the
 * same visual weight — which is what made them read as templated. The system
 * here replaces boxes with typography: a measured column, hairline rules, and
 * generous vertical rhythm, so hierarchy comes from type and space.
 *
 * Ink scale (measured against white):
 *   INK        #1A2A3A  14.6:1  headings
 *   INK_BODY   #46586B   7.3:1  body copy — the old text-secondary was 2.9:1
 *   INK_META   #5A6B7C   5.5:1  eyebrows, captions, meta
 */
export const INK = "text-[#1A2A3A]";
export const INK_BODY = "text-[#46586B]";
export const INK_META = "text-[#5A6B7C]";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className={`${INK_META} text-[11px] font-semibold uppercase tracking-[0.14em] mb-4`}>
      {children}
    </p>
  );
}

export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className={`${INK} text-[2rem] md:text-[2.75rem] font-bold leading-[1.1] tracking-[-0.02em] text-balance`}>
      {children}
    </h1>
  );
}

/** The opening paragraph. Larger than body, lighter than a heading. */
export function Standfirst({ children }: { children: React.ReactNode }) {
  return (
    <p className={`${INK_BODY} text-lg md:text-xl leading-[1.6] mt-6 max-w-[60ch] text-pretty`}>
      {children}
    </p>
  );
}

/** A measured text column. Prose past ~70 characters gets hard to track. */
export function Prose({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`${INK_BODY} text-[15px] md:text-base leading-[1.75] max-w-[68ch] space-y-4 text-pretty ${className}`}>
      {children}
    </div>
  );
}

/** A titled section, separated by a hairline rather than boxed in a card. */
export function Section({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[#E6EBF0] pt-10 md:pt-14 mt-10 md:mt-14 first:border-0 first:pt-0 first:mt-0">
      {kicker && (
        <p className={`${INK_META} text-[11px] font-semibold uppercase tracking-[0.14em] mb-3`}>
          {kicker}
        </p>
      )}
      <h2 className={`${INK} text-xl md:text-2xl font-bold tracking-[-0.01em] mb-5 text-balance`}>
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * A restrained figure row. Numbers carry the weight; labels stay quiet.
 * Deliberately not cards — a hairline between columns is enough.
 */
export function Figures({
  items,
}: {
  items: { value: string; label: string }[];
}) {
  return (
    <dl className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6 my-10">
      {items.map((f) => (
        <div key={f.label} className="border-l border-[#E6EBF0] pl-4">
          <dt className={`${INK} text-2xl md:text-3xl font-bold tracking-[-0.02em]`}>{f.value}</dt>
          <dd className={`${INK_META} text-[13px] leading-snug mt-1.5`}>{f.label}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A single emphasised line — used sparingly, once per page at most. */
export function Pull({ children }: { children: React.ReactNode }) {
  return (
    <p className={`${INK} text-xl md:text-2xl font-medium leading-[1.45] tracking-[-0.01em] my-10 max-w-[48ch] text-balance`}>
      {children}
    </p>
  );
}

/** Label/value pairs — specifications, coverage, terms. */
export function FactList({ items }: { items: { term: string; detail: string }[] }) {
  return (
    <dl className="my-8">
      {items.map((it) => (
        <div
          key={it.term}
          className="grid grid-cols-1 sm:grid-cols-[13rem_1fr] gap-1 sm:gap-6 py-4 border-t border-[#E6EBF0] last:border-b"
        >
          <dt className={`${INK} text-sm font-semibold`}>{it.term}</dt>
          <dd className={`${INK_BODY} text-[15px] leading-[1.7] max-w-[56ch]`}>{it.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
