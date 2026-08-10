"use client";

export function SessionCard({ email }: { email: string }) {
  return (
    <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg text-[#17251C]">Session</h2>
          <p className="mt-1 text-sm text-[#6B6558]">
            You&apos;re signed in as <span className="text-[#17251C]">{email}</span>{" "}
            on this device.
          </p>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="rounded-full border border-[#E4DCC8] px-4 py-2.5 text-sm font-medium text-[#17251C] transition hover:bg-[#17251C]/[0.04]"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
