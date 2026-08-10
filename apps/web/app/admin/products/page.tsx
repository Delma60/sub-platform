import { listProducts } from "../../api/lib/data-store";
import { ProductsManager } from "./products-manager";

export default async function AdminProductsPage() {
  const products = await listProducts();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">
          Catalog
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">Products</h1>
        <p className="mt-1 max-w-md text-[15px] text-[#6B6558]">
          Manage the items customers see in the storefront catalog — pricing,
          category, and availability.
        </p>
      </div>

      <ProductsManager initialProducts={products} />
    </div>
  );
}
