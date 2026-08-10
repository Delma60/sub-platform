"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export function ProfileForm({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const initials = useMemo(
    () =>
      name
        .trim()
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    [name],
  );

  const dirty = name.trim() !== initialName.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setMessage({
          type: "error",
          text: json.error ?? "Couldn't update profile.",
        });
        return;
      }
      setMessage({ type: "success", text: "Profile updated." });
      router.refresh();
    } catch {
      setMessage({
        type: "error",
        text: "Couldn't reach the server. Try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-3xl border border-[#E4DCC8] bg-white p-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EDF0E7] text-sm font-medium text-[#24402F]">
          {initials || "?"}
        </div>
        <div>
          <h2 className="font-display text-lg text-[#17251C]">Profile</h2>
          <p className="text-sm text-[#6B6558]">
            How you appear across the dashboard
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-[#17251C]">
          Full name
        </label>
        <input
          id="name"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-2xl border border-[#E4DCC8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#24402F]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#17251C]">Email</label>
        <input
          disabled
          value={email}
          className="rounded-2xl border border-[#E4DCC8] bg-[#FAF6EF] px-3.5 py-2.5 text-sm text-[#6B6558]"
        />
        <p className="text-xs text-[#6B6558]">
          Contact support to change your email.
        </p>
      </div>

      {message && (
        <p
          className={`rounded-2xl px-3.5 py-2.5 text-sm ${
            message.type === "success"
              ? "bg-[#EDF0E7] text-[#24402F]"
              : "border border-[#F3D4CF] bg-[#FBEAE7] text-[#B3261E]"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || !dirty}
        className="mt-1 self-start rounded-full bg-[#24402F] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#17251C] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
