"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function VideoApprovalButton({ id }: { id: string }) { const router = useRouter(); const [loading, setLoading] = useState(false); return <button type="button" disabled={loading} onClick={async () => { setLoading(true); const res = await fetch(`/api/admin/videos/${id}`, { method: "PATCH" }); setLoading(false); if (res.ok) router.refresh(); }} className="text-sm font-semibold text-lp-accent">{loading ? "Approbation…" : "Approuver"}</button>; }
