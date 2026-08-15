import type { Metadata } from "next";
import Link from "next/link";
import { listProducts } from "../../api/lib/data-store";

export const metadata: Metadata = { title: "Fresh market | Oja", description: "Browse fresh staples available in Oja subscription boxes." };
const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

export default async function ProductsPage() {
  const products = (await listProducts()).filter((product) => product.active);
  return <main className="min-h-screen bg-[var(--paper)] px-6 py-20 text-[var(--ink)] lg:py-28"><div className="mx-auto max-w-6xl">
    <div className="max-w-3xl"><p className="eyebrow">The Oja market</p><h1 className="mt-4 text-5xl leading-tight sm:text-6xl">Fresh foundations for everyday cooking.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--ink-soft)]">Seasonal produce and trusted staples, chosen for quality and packed with the care your kitchen deserves.</p></div>
    {products.length === 0 ? <p className="premium-card mt-12 p-8">No products are available right now. Please check back soon.</p> : <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map((product,index) => <article key={product.id} className="group premium-card overflow-hidden p-3">
      <div className={`relative aspect-[4/3] overflow-hidden rounded-[1.1rem] ${["bg-[#E7EFE4]","bg-[#F7DFD2]","bg-[#EFE5CB]"][index%3]}`}>{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center"><span className="font-display text-6xl text-[var(--accent)]/20">{product.name.charAt(0)}</span></div>}<span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] backdrop-blur">{product.category}</span></div>
      <div className="p-4"><div className="flex items-start justify-between gap-4"><h2 className="text-xl font-semibold">{product.name}</h2><p className="font-semibold text-[var(--accent)]">{currency.format(product.price)}</p></div>{product.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--ink-soft)]">{product.description}</p>}<p className="mt-4 text-xs font-medium uppercase tracking-wider text-[var(--ink-soft)]">{product.unit ? `Per ${product.unit}` : "Box staple"}</p></div>
    </article>)}</div>}
    <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-[var(--accent)] p-8 text-white sm:flex-row sm:items-center sm:p-10"><div><p className="eyebrow !text-[#FFB28F]">Curated for your home</p><h2 className="mt-3 text-3xl">Ready to receive your market?</h2></div><Link href="/pricing" className="premium-button !bg-white !text-[var(--accent)]">Explore plans</Link></div>
  </div></main>;
}