export default function AdminProductsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">Catalog</p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">Products</h1>
      </div>
      <p className="text-[15px] text-[#6B6558]">
        This area will host product creation, editing, and inventory controls.
      </p>
    </div>
  );
}
