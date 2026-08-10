"use client";

import { useState } from "react";

type Preferences = {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  orderUpdates: boolean;
  paymentUpdates: boolean;
  deliveryReminders: boolean;
};

const OPTIONS: { key: keyof Preferences; label: string; description: string }[] = [
  {
    key: "inAppEnabled",
    label: "In-app",
    description: "Show notifications inside your dashboard.",
  },
  {
    key: "emailEnabled",
    label: "Email",
    description: "Send order, payment, and delivery updates by email.",
  },
  {
    key: "smsEnabled",
    label: "SMS",
    description: "Send short delivery reminders to your phone.",
  },
  {
    key: "orderUpdates",
    label: "Order updates",
    description: "Subscription confirmations and generated box orders.",
  },
  {
    key: "paymentUpdates",
    label: "Payment updates",
    description: "Receipts and failed-payment notices.",
  },
  {
    key: "deliveryReminders",
    label: "Delivery reminders",
    description: "Delivery reminders and route status changes.",
  },
];

export function NotificationPreferencesForm({
  initialPreferences,
}: {
  initialPreferences: Preferences;
}) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function toggle(key: keyof Preferences) {
    const next = { ...preferences, [key]: !preferences[key] };
    setPreferences(next);
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next[key] }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setPreferences(preferences);
        setMessage(json.error ?? "Could not update notifications.");
        return;
      }
      setPreferences(json.data.preferences);
    } catch {
      setPreferences(preferences);
      setMessage("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
      <div>
        <h2 className="font-display text-lg text-[#17251C]">Notifications</h2>
        <p className="mt-1 text-sm text-[#6B6558]">
          Choose how Oja should reach you about your subscription.
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        {OPTIONS.map((option) => (
          <label
            key={option.key}
            className="flex items-center justify-between gap-4 rounded-2xl border border-[#E4DCC8] px-4 py-3"
          >
            <span>
              <span className="block text-sm font-medium text-[#17251C]">
                {option.label}
              </span>
              <span className="mt-0.5 block text-xs text-[#6B6558]">
                {option.description}
              </span>
            </span>
            <input
              type="checkbox"
              checked={preferences[option.key]}
              disabled={saving}
              onChange={() => toggle(option.key)}
              className="h-5 w-5 accent-[#24402F]"
            />
          </label>
        ))}
      </div>

      {message && (
        <p className="mt-4 rounded-2xl border border-[#F3D4CF] bg-[#FBEAE7] px-3.5 py-2.5 text-sm text-[#B3261E]">
          {message}
        </p>
      )}
    </section>
  );
}
