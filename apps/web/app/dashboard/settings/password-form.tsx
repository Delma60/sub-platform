"use client";

import { useMemo, useState } from "react";

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const tooShort = newPassword.length > 0 && newPassword.length < 8;
  const sameAsCurrent =
    currentPassword.length > 0 && newPassword.length > 0 && newPassword === currentPassword;
  const mismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;

  const canSubmit = useMemo(
    () =>
      currentPassword.length >= 8 &&
      newPassword.length >= 8 &&
      newPassword === confirmPassword &&
      newPassword !== currentPassword,
    [currentPassword, newPassword, confirmPassword],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setMessage({
          type: "error",
          text: json.error ?? "Couldn't update password.",
        });
        return;
      }
      setMessage({ type: "success", text: "Password updated." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTouched(false);
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
      <div>
        <h2 className="text-lg font-semibold text-[#15150F]">Password</h2>
        <p className="text-sm text-[#706C60]">Use at least 8 characters</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#15150F]">Current password</label>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="rounded-md border border-[#E6E3DA] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#2E3B29]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#15150F]">New password</label>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={`rounded-md border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#2E3B29] ${
            sameAsCurrent ? "border-[#B3261E]" : "border-[#E6E3DA]"
          }`}
        />
        {tooShort && <p className="text-xs text-[#706C60]">At least 8 characters.</p>}
        {sameAsCurrent && (
          <p className="text-xs text-[#B3261E]">New password must differ from your current one.</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#15150F]">Confirm new password</label>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`rounded-md border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#2E3B29] ${
            mismatch ? "border-[#B3261E]" : "border-[#E6E3DA]"
          }`}
        />
        {mismatch && <p className="text-xs text-[#B3261E]">Passwords don't match.</p>}
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
        disabled={saving || (touched && !canSubmit)}
        className="mt-1 self-start rounded-md bg-[#2E3B29] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#243020] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
