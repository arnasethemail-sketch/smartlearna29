type BrandProps = {
  tone?: "dark" | "light";
  label?: string;
};

export function Brand({ tone = "dark", label = "MathPractice" }: BrandProps) {
  const isLight = tone === "light";

  return (
    <div className="flex items-center gap-2.5" aria-label={label}>
      <span className="grid h-10 w-10 grid-cols-2 gap-1 rounded-xl border-2 border-[#25272b] bg-[#dfff38] p-2 shadow-[3px_3px_0_#25272b]">
        <span className="rounded-sm bg-[#25272b]" />
        <span className="rounded-sm bg-[#4f6df5]" />
        <span className="rounded-sm bg-[#4f6df5]" />
        <span className="rounded-sm bg-[#25272b]" />
      </span>
      <span
        className={`text-lg font-black tracking-[-0.045em] sm:text-xl ${
          isLight ? "text-white" : "text-[#17181a]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export function AnnouncementBar({
  subject = "Math",
}: {
  subject?: string;
}) {
  return (
    <div className="border-b border-[#e4dfee] bg-[linear-gradient(90deg,#e9edff_0%,#f8eaf5_52%,#fff0d9_100%)] px-4 py-3 text-center text-sm font-extrabold text-[#30205f]">
      <span
        className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-[#dfff38] text-[#2f3900]"
        aria-hidden="true"
      >
        {"\u26a1"}
      </span>
      Small steps today build big {subject.toLowerCase()} confidence.
      <a
        href="#topics"
        className="ml-2 underline decoration-2 underline-offset-4"
      >
        Start practicing
      </a>
    </div>
  );
}
