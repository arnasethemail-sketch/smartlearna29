type TopicCardProps = {
  name: string;
  icon: string;
  description: string;
  accent: "purple" | "mint";
  number: string;
  onSelect: () => void;
};

const accentStyles = {
  purple: {
    card: "bg-[#f0ebff]",
    icon: "bg-[#6b4ce6] shadow-[0_6px_0_#4c32bc]",
    badge: "bg-white/75 text-[#6b4ce6]",
    dot: "bg-[#ffcfdf]",
  },
  mint: {
    card: "bg-[#eafaf4]",
    icon: "bg-[#22ad7a] shadow-[0_6px_0_#147b56]",
    badge: "bg-white/80 text-[#16805c]",
    dot: "bg-[#ffd84d]",
  },
} as const;

export function TopicCard({
  name,
  icon,
  description,
  accent,
  number,
  onSelect,
}: TopicCardProps) {
  const styles = accentStyles[accent];

  return (
    <article
      className={`group relative flex min-h-80 flex-col overflow-hidden rounded-[2rem] p-7 shadow-[0_18px_50px_rgba(51,40,110,0.10)] ring-1 ring-[#5b47b5]/10 transition duration-200 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(51,40,110,0.16)] sm:p-8 ${styles.card}`}
    >
      <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-70 ${styles.dot}`} aria-hidden="true" />
      <div className="relative flex items-start justify-between">
        <div
          className={`flex h-20 w-20 -rotate-3 items-center justify-center rounded-[1.6rem] text-5xl font-black text-white transition group-hover:rotate-0 ${styles.icon}`}
          aria-hidden="true"
        >
          {icon}
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-black tracking-[0.14em] ${styles.badge}`}>
          TOPIC {number}
        </span>
      </div>

      <h3 className="relative mt-7 text-3xl font-black tracking-[-0.035em] text-[#17213b] sm:text-4xl">
        {name}
      </h3>
      <p className="relative mt-3 flex-1 text-base font-semibold leading-7 text-[#69728a] sm:text-lg">
        {description}
      </p>
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Start ${name}`}
        className="relative mt-7 inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-full bg-[#ff6633] px-6 py-3.5 text-lg font-black text-white shadow-[0_6px_0_#c93d17] transition hover:-translate-y-0.5 hover:bg-[#f25526] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#6b4ce6] active:translate-y-1 active:shadow-none"
      >
        Start {name}
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#ff6633]" aria-hidden="true">
          {"\u2192"}
        </span>
      </button>
    </article>
  );
}
