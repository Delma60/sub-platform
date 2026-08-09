"use client";

import { useState } from "react";
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      className="flex flex-col gap-3 rounded-3xl border border-[#E4DCC8] bg-white p-6"
    >
      <h2 className="font-display text-xl text-[#17251C]">Profile</h2>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Full name</label>
        <input
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-[#E4DCC8] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#24402F]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Email</label>
        <input
          disabled
          value={email}
          className="rounded-md border border-[#E4DCC8] bg-[#FAF6EF] px-4 py-2.5 text-sm text-[#6B6558]"
        />
        <p className="text-xs text-[#6B6558]">
          Contact support to change your email.
        </p>
      </div>

      {message && (
        <p
          className={`rounded-md px-3 py-2 text-sm ${
            message.type === "success"
              ? "bg-[#24402F]/10 text-[#24402F]"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-2 self-start rounded-md bg-[#24402F] px-5 py-2.5 text-sm font-medium text-[#FAF6EF] transition hover:bg-[#1a2f22] disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
