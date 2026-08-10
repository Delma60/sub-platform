import { getCurrentUser } from "../../../lib/get-current-user";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { SessionCard } from "./session-card";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">
          Settings
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">
          Account settings
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileForm initialName={user?.name ?? ""} email={user?.email ?? ""} />
        <PasswordForm />
      </div>

      <SessionCard email={user?.email ?? ""} />
    </div>
  );
}
