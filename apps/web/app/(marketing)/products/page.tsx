import type { Metadata } from "next";
import { listProducts } from "../../api/lib/data-store";

export const metadata: Metadata = { title: "Market box catalog | Oja", description: "Browse fresh staples available in Oja subscription boxes." };

export default async function ProductsPage() {
  const products = (await listProducts()).filter((product) => product.active);
  return (
    <main className="min-h-screen bg-[var(--paper)] px-6 py-20 text-[var(--ink)]">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">Market catalog</p>
        <h1 className="mt-3 text-4xl font-semibold">What can go in your box</h1>
        <p className="mt-4 max-w-2xl text-[var(--ink-soft)]">Seasonal availability can change, but these are the staples we currently source.</p>
        {products.length === 0 ? <p className="mt-12 rounded-lg border border-[var(--line)] p-8">No products are available right now. Please check back soon.</p> : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => <article key={product.id} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6">
              <p className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">{product.category}</p>
              <h2 className="mt-2 text-xl font-semibold">{product.name}</h2>
              {product.description && <p className="mt-2 text-sm text-[var(--ink-soft)]">{product.description}</p>}
              <p className="mt-5 font-medium">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(product.price)} {product.unit ? `/ ${product.unit}` : ""}</p>
            </article>)}
          </div>
        )}
      </div>
    </main>
  );
}
