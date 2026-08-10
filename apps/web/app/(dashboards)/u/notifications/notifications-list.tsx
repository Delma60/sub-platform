"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StoredNotification } from "../../../api/lib/data-store";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function NotificationsList({
  initialNotifications,
  unreadCount,
}: {
  initialNotifications: StoredNotification[];
  unreadCount: number;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [busy, setBusy] = useState<string | null>(null);

  async function markRead(notificationId?: string) {
    setBusy(notificationId ?? "all");
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationId ? { notificationId } : { all: true }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) return;

      if (notificationId) {
        setNotifications((items) =>
          items.map((item) =>
            item.id === notificationId
              ? { ...item, readAt: new Date().toISOString() }
              : item
          )
        );
      } else {
        const now = new Date().toISOString();
        setNotifications((items) => items.map((item) => ({ ...item, readAt: now })));
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-3xl border border-[#E4DCC8] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4DCC8] px-5 py-4">
        <div>
          <h2 className="font-display text-lg text-[#17251C]">Inbox</h2>
          <p className="text-sm text-[#6B6558]">{unreadCount} unread</p>
        </div>
        <button
          onClick={() => markRead()}
          disabled={busy === "all" || unreadCount === 0}
          className="rounded-full border border-[#E4DCC8] px-4 py-2 text-sm text-[#17251C] transition hover:border-[#24402F] disabled:opacity-50"
        >
          Mark all read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <p className="font-medium text-[#17251C]">No notifications yet</p>
          <p className="mt-2 text-sm text-[#6B6558]">
            Order, payment, and delivery updates will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#E4DCC8]">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto] ${
                notification.readAt ? "bg-white" : "bg-[#FAF6EF]"
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-[#17251C]">{notification.title}</h3>
                  {!notification.readAt && (
                    <span className="rounded-full bg-[#24402F] px-2 py-0.5 text-[11px] font-medium text-white">
                      New
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-[#6B6558]">{notification.body}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#9A9388]">
                  {formatDate(notification.createdAt)}
                </p>
              </div>

              {!notification.readAt && (
                <button
                  onClick={() => markRead(notification.id)}
                  disabled={busy === notification.id}
                  className="self-start rounded-full border border-[#E4DCC8] px-3 py-1.5 text-xs text-[#17251C] hover:border-[#24402F] disabled:opacity-50"
                >
                  Mark read
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
