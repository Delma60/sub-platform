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
      className="flex flex-col gap-4 rounded-lg border border-[#E6E3DA] bg-white p-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EDF0E7] text-sm font-medium text-[#2E3B29]">
          {initials || "?"}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#15150F]">Profile</h2>
          <p className="text-sm text-[#706C60]">
            How you appear across the dashboard
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-[#15150F]">
          Full name
        </label>
        <input
          id="name"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-[#E6E3DA] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#2E3B29]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#15150F]">Email</label>
        <input
          disabled
          value={email}
          className="rounded-md border border-[#E6E3DA] bg-[#F7F7F3] px-3.5 py-2.5 text-sm text-[#706C60]"
        />
        <p className="text-xs text-[#706C60]">
          Contact support to change your email.
        </p>
      </div>

      {message && (
        <p
          className={`rounded-md px-3 py-2 text-sm ${
            message.type === "success"
              ? "bg-[#EDF0E7] text-[#2E3B29]"
              : "border border-[#F3D4CF] bg-[#FBEAE7] text-[#B3261E]"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || !dirty}
        className="mt-1 self-start rounded-md bg-[#2E3B29] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#243020] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
