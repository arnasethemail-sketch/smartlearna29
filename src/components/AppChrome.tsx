export function Brand() {
  return (
    <div className="flex items-center gap-3" aria-label="Grade 4 Math Practice">
      <span className="flex h-11 w-11 rotate-3 items-center justify-center rounded-2xl bg-[#ff6633] text-2xl font-black text-white shadow-[0_4px_0_#c93d17]">
        +
      </span>
      <span className="text-lg font-black tracking-tight text-white sm:text-xl">
        Math<span className="text-[#ffd84d]">Practice</span>
      </span>
    </div>
  );
}

export function AnnouncementBar() {
  return (
    <div className="bg-[#ff6633] px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.12em] text-white sm:text-sm">
      <span className="mr-2 text-[#ffd84d]" aria-hidden="true">
        {"\u2605"}
      </span>
      Small steps, big math confidence
    </div>
  );
}
