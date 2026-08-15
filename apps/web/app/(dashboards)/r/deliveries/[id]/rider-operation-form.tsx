"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DeliveryStatus } from "../../../../api/lib/data-store";

const ISSUES = [
  ["customer_unavailable", "Customer unavailable"],
  ["missing_item", "Missing item"],
  ["damaged_item", "Damaged item"],
  ["wrong_address", "Wrong address"],
  ["payment_issue", "Payment issue"],
] as const;

export function RiderOperationForm({ deliveryId, status }: { deliveryId: string; status: DeliveryStatus }) {
  const router = useRouter();
  const [mode, setMode] = useState<"complete" | "issue" | "reschedule" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [riderNote, setRiderNote] = useState("");
  const [issueType, setIssueType] = useState("");
  const [rescheduledDate, setRescheduledDate] = useState("");
  const [proofImageUrl, setProofImageUrl] = useState("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  async function mutate(payload: Record<string, unknown>) {
    setBusy(true); setError(null);
    try {
      const response = await fetch(`/api/rider/deliveries/${deliveryId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error ?? "Could not update delivery");
      setMode(null); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update delivery"); }
    finally { setBusy(false); }
  }

  async function uploadProof(file: File) {
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { setError("Choose an image up to 5 MB."); return; }
    setBusy(true); setError(null);
    try {
      const signedResponse = await fetch("/api/uploads/sign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, contentType: file.type, folder: "proofs" }) });
      const signed = await signedResponse.json();
      if (!signedResponse.ok || !signed.success) throw new Error(signed.error ?? "Could not prepare upload");
      const upload = await fetch(signed.data.upload.uploadUrl, { method: "PUT", headers: signed.data.upload.headers, body: file });
      if (!upload.ok) throw new Error("Proof upload failed");
      setProofImageUrl(signed.data.upload.publicUrl);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Proof upload failed"); }
    finally { setBusy(false); }
  }

  function captureLocation() {
    if (!navigator.geolocation) { setError("Location is not available on this device."); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocation({ latitude: coords.latitude, longitude: coords.longitude }),
      () => setError("Location permission was not granted."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return <div className="flex flex-col gap-4">
    {status === "scheduled" && <button disabled={busy} onClick={() => void mutate({ status: "out_for_delivery" })} className="min-h-12 rounded-xl bg-[#24402F] px-5 py-3 text-sm font-medium text-white disabled:opacity-60">Start delivery</button>}
    {status !== "delivered" && status !== "skipped" && <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <button onClick={() => setMode("complete")} className="min-h-12 rounded-xl bg-[#24402F] px-4 py-3 text-sm font-medium text-white">Complete</button>
      <button onClick={() => setMode("issue")} className="min-h-12 rounded-xl border border-[#B3261E] px-4 py-3 text-sm font-medium text-[#B3261E]">Report issue</button>
      <button onClick={() => setMode("reschedule")} className="min-h-12 rounded-xl border border-[#E4DCC8] px-4 py-3 text-sm font-medium">Reschedule</button>
    </div>}

    {mode === "complete" && <div className="space-y-3 rounded-2xl bg-[#FAF6EF] p-4">
      <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Recipient name" className="w-full rounded-xl border border-[#E4DCC8] px-4 py-3" />
      <label className="block min-h-12 cursor-pointer rounded-xl border border-dashed border-[#E4DCC8] px-4 py-3 text-center text-sm"><input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadProof(file); }} />{proofImageUrl ? "Proof photo ready — tap to replace" : "Take or upload proof photo"}</label>
      <textarea value={riderNote} onChange={(e) => setRiderNote(e.target.value)} placeholder="Rider note (optional)" className="w-full rounded-xl border border-[#E4DCC8] px-4 py-3" />
      <button type="button" onClick={captureLocation} className="rounded-xl border border-[#E4DCC8] px-4 py-3 text-sm">{location ? "Location captured" : "Add current location (optional)"}</button>
      <button disabled={busy || !recipientName.trim() || !proofImageUrl} onClick={() => void mutate({ status: "delivered", recipientName, proofImageUrl, riderNote: riderNote || undefined, ...location })} className="w-full min-h-12 rounded-xl bg-[#24402F] px-5 py-3 text-sm font-medium text-white disabled:opacity-50">Confirm delivery</button>
    </div>}

    {mode === "issue" && <div className="space-y-3 rounded-2xl bg-[#FAF6EF] p-4"><select value={issueType} onChange={(e) => setIssueType(e.target.value)} className="w-full rounded-xl border border-[#E4DCC8] px-4 py-3"><option value="">Choose issue</option>{ISSUES.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select><textarea value={riderNote} onChange={(e) => setRiderNote(e.target.value)} placeholder="What happened?" className="w-full rounded-xl border border-[#E4DCC8] px-4 py-3" /><button disabled={busy || !issueType} onClick={() => void mutate({ status: "issue", issueType, riderNote: riderNote || undefined })} className="w-full min-h-12 rounded-xl bg-[#B3261E] px-5 py-3 text-sm font-medium text-white disabled:opacity-50">Submit issue</button></div>}
    {mode === "reschedule" && <div className="space-y-3 rounded-2xl bg-[#FAF6EF] p-4"><input type="datetime-local" value={rescheduledDate} min={new Date().toISOString().slice(0,16)} onChange={(e) => setRescheduledDate(e.target.value)} className="w-full rounded-xl border border-[#E4DCC8] px-4 py-3" /><textarea value={riderNote} onChange={(e) => setRiderNote(e.target.value)} placeholder="Reason for rescheduling" className="w-full rounded-xl border border-[#E4DCC8] px-4 py-3" /><button disabled={busy || !rescheduledDate} onClick={() => void mutate({ status: "scheduled", rescheduledDate: new Date(rescheduledDate).toISOString(), riderNote: riderNote || undefined })} className="w-full min-h-12 rounded-xl bg-[#24402F] px-5 py-3 text-sm font-medium text-white disabled:opacity-50">Confirm new time</button></div>}
    {error && <p role="alert" className="rounded-xl bg-[#FBEAE7] p-3 text-sm text-[#B3261E]">{error}</p>}
  </div>;
}
