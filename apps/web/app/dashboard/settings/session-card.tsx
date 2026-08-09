"use client";

export function SessionCard({ email }: { email: string }) {
  return (
    <div className="rounded-lg border border-[#E6E3DA] bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#15150F]">Session</h2>
          <p className="mt-1 text-sm text-[#706C60]">
            You're signed in as <span className="text-[#15150F]">{email}</span>{" "}
            on this device.
          </p>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="rounded-md border border-[#E6E3DA] px-4 py-2.5 text-sm font-medium text-[#15150F] transition hover:bg-[#F1EFE9]"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
