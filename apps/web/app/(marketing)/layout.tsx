import { CustomerNavbar } from "../components/customer-navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CustomerNavbar />
      {children}
    </>
  );
}
