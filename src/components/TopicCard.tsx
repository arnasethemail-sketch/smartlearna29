type TopicCardProps = {
  name: string;
  icon: string;
  description: string;
  accent: "purple" | "mint" | "sky" | "coral";
  number: string;
  buttonLabel?: string;
  statusLabel?: string;
  onSelect: () => void;
};

const accentStyles = {
  purple: {
    soft: "bg-[#edf0ff]",
    icon: "border-[#3348a5] bg-[#4f6df5] text-white",
    number: "text-[#3f57c8]",
    status: "bg-[#eef1ff] text-[#3f57c8]",
  },
  mint: {
    soft: "bg-[#e9f9f3]",
    icon: "border-[#17624c] bg-[#36c998] text-[#123d31]",
    number: "text-[#167052]",
    status: "bg-[#e5f8f1] text-[#167052]",
  },
  sky: {
    soft: "bg-[#f4edff]",
    icon: "border-[#5c3ca0] bg-[#9b72e8] text-white",
    number: "text-[#6948ad]",
    status: "bg-[#f1eaff] text-[#6948ad]",
  },
  coral: {
    soft: "bg-[#fff0e9]",
    icon: "border-[#9b3f28] bg-[#ff7657] text-white",
    number: "text-[#b34d35]",
    status: "bg-[#ffebe5] text-[#a6422d]",
  },
} as const;

export function TopicCard({
  name,
  icon,
  description,
  accent,
  number,
  buttonLabel,
  statusLabel = "Ready",
  onSelect,
}: TopicCardProps) {
  const styles = accentStyles[accent];
  const resolvedButtonLabel = buttonLabel ?? `Start ${name}`;

  return (
    <article className="group flex min-h-[330px] flex-col overflow-hidden rounded-[1.4rem] border-2 border-[#e0e1e4] bg-white transition duration-200 hover:-translate-y-1 hover:border-[#c7cad2] hover:shadow-[0_14px_32px_rgba(33,35,44,0.09)]">
      <div className={`relative h-28 overflow-hidden ${styles.soft}`}>
        <div className="absolute -right-8 -top-9 h-28 w-28 rounded-full border-[18px] border-white/45" />
        <span
          className={`absolute bottom-5 left-6 flex h-16 w-16 items-center justify-center rounded-[1.15rem] border-2 text-4xl font-black shadow-[4px_5px_0_rgba(25,27,35,0.12)] transition group-hover:-rotate-3 ${styles.icon}`}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span
          className={`absolute right-5 top-5 text-xs font-black uppercase tracking-[0.16em] ${styles.number}`}
        >
          Topic {number}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-2xl font-black tracking-[-0.035em] text-[#191a1d]">
            {name}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${styles.status}`}
          >
            {statusLabel}
          </span>
        </div>
        <p className="mt-3 flex-1 text-sm font-semibold leading-6 text-[#6a6c72]">
          {description}
        </p>
        <button
          type="button"
          onClick={onSelect}
          aria-label={resolvedButtonLabel}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#4f6df5] px-5 py-3 text-base font-black text-white shadow-[0_4px_0_#2f48b9] transition hover:-translate-y-0.5 hover:bg-[#455fdc] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#dfff38] active:translate-y-1 active:shadow-none"
        >
          {resolvedButtonLabel}
          <span aria-hidden="true">{"\u2192"}</span>
        </button>
      </div>
    </article>
  );
}
