import { getCurrentUser } from "../../lib/get-current-user";
import { listAddresses } from "../../api/lib/data-store";
import { AddressBook } from "./address-book";

export default async function AddressesPage() {
  const user = await getCurrentUser();
  const addresses = user ? await listAddresses(user.id) : [];

  return <AddressBook initialAddresses={addresses} />;
}
