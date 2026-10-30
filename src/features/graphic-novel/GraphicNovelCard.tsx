import { artFor, assetUrl } from "./artwork";

export function GraphicNovelCard({ onSelect }: { onSelect: () => void }) {
  const cover = artFor("ch01-p08");
  return <article className="relative col-span-full overflow-hidden rounded-[1.7rem] border border-[#cdb9d6] bg-[#262138] text-[#fff1d9] shadow-[0_14px_30px_#35203b14] md:grid md:grid-cols-[1fr_1fr]">
    <div className="px-7 py-9 sm:px-10"><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#e6bd7b]">New collection · Grade 5 English</p><h3 className="mt-4 font-serif text-4xl leading-tight">Graphic Novel Lessons</h3><p className="mt-3 text-lg font-bold text-[#efcb8f]">Hotel Transylvania</p><p className="mt-4 max-w-md text-sm leading-7 text-[#d4c5dc]">Follow a 24-chapter illustrated story. Explore the characters, build your vocabulary, and turn your ideas into thoughtful writing.</p><button onClick={onSelect} className="mt-7 inline-flex min-h-12 items-center gap-8 rounded-xl bg-[#f3ce87] px-6 py-3 text-sm font-extrabold text-[#30233e] shadow-[0_4px_0_#ac804a] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#fff0ca]">Explore Graphic Novel Lessons <span aria-hidden="true">↗</span></button></div>
    {cover && <img src={assetUrl(cover.src)} alt={cover.alt} width="960" height="640" loading="lazy" className="h-full min-h-72 w-full object-cover" />}
  </article>;
}
