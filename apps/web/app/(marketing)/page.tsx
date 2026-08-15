import Image from "next/image";
import Link from "next/link";

const steps = [
  ["01", "Choose your box", "Pick a plan sized for your kitchen and choose your delivery rhythm."],
  ["02", "We source fresh", "Trusted growers and market partners select produce at its seasonal best."],
  ["03", "Unpack more time", "Your curated market arrives at your door, ready for the week ahead."],
];
const categories = [
  ["Market vegetables", "Tomatoes, peppers, onions, ugu, ginger and everyday aromatics."],
  ["Grains & staples", "Rice, beans, garri, yam and trusted foundations for Nigerian kitchens."],
  ["Pantry essentials", "Oils, crayfish, seasonings and the details that make a meal complete."],
];

export default function HomePage() {
  return <main className="overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
    <section className="px-4 pb-16 pt-5 sm:px-6 lg:pb-24">
      <div className="relative mx-auto min-h-[680px] max-w-[1400px] overflow-hidden rounded-[2rem] bg-[#143D2C] sm:min-h-[720px]">
        <Image src="/oja-premium-hero.png" alt="A curated Oja market box filled with fresh Nigerian produce" fill priority sizes="(max-width: 768px) 100vw, 1400px" className="object-cover object-[64%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#102E22]/95 via-[#143D2C]/70 to-transparent" />
        <div className="relative z-10 flex min-h-[680px] max-w-3xl flex-col justify-end px-7 py-12 text-white sm:min-h-[720px] sm:px-12 sm:py-16 lg:px-20">
          <p className="eyebrow !text-[#FFB28F]">Farm-led · kitchen-ready</p>
          <h1 className="mt-5 max-w-2xl text-5xl leading-[0.94] sm:text-6xl lg:text-[5.5rem]">The market, beautifully curated.</h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg">Fresh Nigerian staples, selected with care and delivered on a rhythm that works for your home.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link href="/pricing" className="premium-button !bg-[#F5A37F] !text-[#173A2B] hover:!bg-white">Explore boxes</Link><Link href="/products" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10">See fresh picks</Link></div>
          <div className="mt-12 grid max-w-xl grid-cols-3 gap-5 border-t border-white/20 pt-6"><Metric value="40+" label="source partners" /><Metric value="6–25" label="items per box" /><Metric value="100%" label="flexible plans" /></div>
        </div>
      </div>
    </section>

    <section id="how-it-works" className="px-6 py-20 lg:py-28"><div className="mx-auto max-w-6xl"><div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="eyebrow">Thoughtful by design</p><h2 className="mt-4 text-4xl leading-tight sm:text-5xl">Less market stress.<br/>More good food.</h2><p className="mt-5 max-w-sm leading-7 text-[var(--ink-soft)]">A dependable ritual for homes that care about freshness, quality and time.</p></div><div className="grid gap-4 sm:grid-cols-3">{steps.map(([number,title,copy]) => <article key={number} className="premium-card p-6"><span className="text-xs font-bold text-[var(--harvest)]">{number}</span><h3 className="mt-12 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{copy}</p></article>)}</div></div></div></section>

    <section id="whats-inside" className="bg-[var(--accent)] px-6 py-20 text-white lg:py-28"><div className="mx-auto max-w-6xl"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="eyebrow !text-[#FFB28F]">Inside every delivery</p><h2 className="mt-4 text-4xl sm:text-5xl">The foundations of a good kitchen.</h2></div><Link href="/products" className="text-sm font-semibold underline decoration-white/30 underline-offset-8">Browse the market</Link></div><div className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-white/15 sm:grid-cols-3">{categories.map(([title,copy],index) => <article key={title} className="bg-[#164B35] p-8"><span className="text-5xl font-display text-white/15">0{index+1}</span><h3 className="mt-10 text-2xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-white/65">{copy}</p></article>)}</div></div></section>

    <section id="plans" className="px-6 py-20 lg:py-28"><div className="mx-auto flex max-w-5xl flex-col items-center rounded-[2rem] bg-[#F1DDC4] px-7 py-16 text-center sm:px-12"><p className="eyebrow">Your weekly ritual</p><h2 className="mt-4 max-w-2xl text-4xl leading-tight sm:text-6xl">A better-stocked kitchen starts here.</h2><p className="mt-5 max-w-xl leading-7 text-[var(--ink-soft)]">Boxes from ₦15,000 with flexible schedules, easy swaps and no long-term commitment.</p><Link href="/pricing" className="premium-button mt-8">Find your box</Link></div></section>

    <footer id="faq" className="border-t border-[var(--line)] px-6 py-12"><div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 sm:flex-row"><div><p className="font-display text-3xl">Oja.</p><p className="mt-2 text-sm text-[var(--ink-soft)]">A fresher way to stock your kitchen.</p></div><div className="flex gap-8 text-sm text-[var(--ink-soft)]"><Link href="/products">Market</Link><Link href="/pricing">Plans</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link></div></div></footer>
  </main>;
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div><p className="font-display text-2xl sm:text-3xl">{value}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/55">{label}</p></div>;
}