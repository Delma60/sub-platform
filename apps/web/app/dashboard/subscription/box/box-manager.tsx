"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type BoxItem = { id: string; name: string; category: string };
type Slot = { slotId: string; item: BoxItem; original: BoxItem | null };
type Box = {
  slots: Slot[];
  swapsUsed: number;
  swapLimit: number | null;
  swapsRemaining: number | null;
};

export function BoxManager({
  subscriptionId,
  initialBox,
  catalog,
}: {
  subscriptionId: string;
  initialBox: Box;
  catalog: BoxItem[];
}) {
  const router = useRouter();
  const [box, setBox] = useState(initialBox);
  const [busySlot, setBusySlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locked = box.swapLimit === 0;
  const atLimit = box.swapsRemaining === 0;

  async function handleSwap(slotId: string, toItemId: string) {
    if (!toItemId) return;
    setBusySlot(slotId);
    setError(null);
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}/box`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromItemId: slotId, toItemId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Couldn't swap that item.");
        return;
      }
      setBox(json.data.box);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setBusySlot(null);
    }
  }

  async function handleReset(slotId: string) {
    setBusySlot(slotId);
    setError(null);
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}/box`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", itemId: slotId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Couldn't undo that swap.");
        return;
      }
      setBox(json.data.box);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setBusySlot(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl border border-[#E4DCC8] bg-white p-5">
        <p className="text-sm text-[#6B6558]">
          {locked
            ? "Item swaps aren't available on the Single plan."
            : box.swapLimit === null
              ? `${box.swapsUsed} item${box.swapsUsed === 1 ? "" : "s"} swapped so far`
              : `${box.swapsRemaining} of ${box.swapLimit} swaps remaining`}
        </p>
      </div>

      {error && (
        <p className="rounded-2xl border border-[#F3D4CF] bg-[#FBEAE7] px-4 py-3 text-sm text-[#B3261E]">
          {error}
        </p>
      )}

      <div className="rounded-3xl border border-[#E4DCC8] bg-white p-6">
        <div className="flex flex-col divide-y divide-[#E4DCC8]">
          {box.slots.map((slot) => {
            const isSwapped = slot.original !== null;
            const isBusy = busySlot === slot.slotId;
            const usedElsewhere = new Set(
              box.slots.filter((s) => s.slotId !== slot.slotId).map((s) => s.item.id),
            );
            const options = catalog.filter((c) => !usedElsewhere.has(c.id));

            return (
              <div
                key={slot.slotId}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-[#17251C]">{slot.item.name}</p>
                  <p className="mt-0.5 text-xs text-[#6B6558]">
                    {slot.item.category}
                    {isSwapped && slot.original && <> · swapped from {slot.original.name}</>}
                  </p>
                </div>

                {!locked && (
                  <div className="flex items-center gap-2">
                    {isSwapped ? (
                      <button
                        type="button"
                        onClick={() => handleReset(slot.slotId)}
                        disabled={isBusy}
                        className="rounded-full border border-[#E4DCC8] px-3.5 py-1.5 text-xs font-medium text-[#17251C] transition hover:bg-[#17251C]/[0.04] disabled:opacity-60"
                      >
                        {isBusy ? "Undoing…" : "Undo swap"}
                      </button>
                    ) : (
                      <select
                        defaultValue=""
                        disabled={isBusy || atLimit}
                        onChange={(e) => handleSwap(slot.slotId, e.target.value)}
                        className="rounded-full border border-[#E4DCC8] bg-white px-3 py-1.5 text-xs font-medium text-[#17251C] outline-none transition focus:border-[#24402F] disabled:opacity-60"
                      >
                        <option value="" disabled>
                          {isBusy ? "Swapping…" : atLimit ? "Swap limit reached" : "Swap for…"}
                        </option>
                        {options.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
