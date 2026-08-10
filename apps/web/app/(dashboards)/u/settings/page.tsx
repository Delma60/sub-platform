import { getCurrentUser } from "../../../lib/get-current-user";
import { getNotificationPreferences } from "../../../api/lib/data-store";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { SessionCard } from "./session-card";
import { NotificationPreferencesForm } from "./notification-preferences-form";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const preferences = user ? await getNotificationPreferences(user.id) : null;

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
        <ProfileForm
          initialName={user?.name ?? ""}
          email={user?.email ?? ""}
          initialPhone={user?.phone ?? ""}
        />
        <PasswordForm />
      </div>

      {preferences && <NotificationPreferencesForm initialPreferences={preferences} />}

      <SessionCard email={user?.email ?? ""} />
    </div>
  );
}
