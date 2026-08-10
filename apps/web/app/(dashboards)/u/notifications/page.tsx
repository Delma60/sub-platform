import { getCurrentUser } from "../../../lib/get-current-user";
import {
  countUnreadNotifications,
  listNotifications,
} from "../../../api/lib/data-store";
import { NotificationsList } from "./notifications-list";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  const [notifications, unreadCount] = user
    ? await Promise.all([
        listNotifications(user.id),
        countUnreadNotifications(user.id),
      ])
    : [[], 0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-[#BC8A31]">
          Notifications
        </p>
        <h1 className="mt-2 font-display text-3xl text-[#17251C]">
          Updates from Oja
        </h1>
      </div>

      <NotificationsList
        initialNotifications={notifications}
        unreadCount={unreadCount}
      />
    </div>
  );
}
