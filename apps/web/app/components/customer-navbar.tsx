import { getCurrentUser } from "../lib/get-current-user";
import { CustomerNavbarClient } from "./customer-navbar-client";

export async function CustomerNavbar() {
  const user = await getCurrentUser();

  return (
    <CustomerNavbarClient
      user={user ? { name: user.name, email: user.email } : null}
    />
  );
}
