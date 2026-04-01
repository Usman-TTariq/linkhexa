"use client";

import { useEffect, useState } from "react";

type SignupRow = {
  id: string;
  username: string;
  email: string;
  role: string;
  company_name: string | null;
  website: string | null;
  payment_email: string | null;
  city: string | null;
  country: string | null;
  approval_status: string;
  created_at: string;
};

export default function AdminSignupsSection() {
  const [signups, setSignups] = useState<SignupRow[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/signups", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSignups(data.signups ?? []);
      }
    };
    load();
  }, []);

  const updateApproval = async (id: string, approval_status: "approved" | "rejected") => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/signups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ approval_status }),
      });
      if (res.ok) {
        setSignups((prev) =>
          prev.map((s) => (s.id === id ? { ...s, approval_status } : s))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const loginAsPublisher = async (publisherId: string) => {
    setImpersonatingId(publisherId);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ publisherId }),
      });
      if (res.ok) {
        window.location.href = "/dashboard";
      }
    } finally {
      setImpersonatingId(null);
    }
  };

  const pending = signups.filter((s) => s.approval_status === "pending");
  const approved = signups.filter((s) => s.approval_status === "approved");
  const rejected = signups.filter((s) => s.approval_status === "rejected");

  return (
    <>
      <section id="admin-all-signups">
        <h2
          className="text-xl font-bold text-white sm:text-2xl"
          style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
        >
          All signups
        </h2>
        <p className="mt-1 text-zinc-400">Approve or reject accounts so publishers can use the dashboard.</p>
      </section>

      <section className="mt-8">
        <h3 className="text-lg font-semibold text-white">Directory</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Pending: {pending.length} · Approved: {approved.length} · Rejected: {rejected.length}
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/80">
          {signups.length === 0 ? (
            <p className="p-6 text-center text-zinc-500">No signups yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="p-3 font-medium">Username</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Role</th>
                  <th className="p-3 font-medium">Company</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {signups.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 text-white">
                    <td className="p-3">{row.username}</td>
                    <td className="p-3">{row.email}</td>
                    <td className="p-3 capitalize">{row.role}</td>
                    <td className="p-3">{row.company_name || "—"}</td>
                    <td className="p-3">
                      <span
                        className={
                          row.approval_status === "approved"
                            ? "text-emerald-400"
                            : row.approval_status === "rejected"
                              ? "text-red-400"
                              : "text-amber-400"
                        }
                      >
                        {row.approval_status}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-500">
                      {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-3 text-right">
                      {row.approval_status === "pending" && (
                        <span className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => updateApproval(row.id, "approved")}
                            disabled={updatingId === row.id}
                            className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => updateApproval(row.id, "rejected")}
                            disabled={updatingId === row.id}
                            className="rounded bg-red-600/80 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </span>
                      )}
                      {row.approval_status === "approved" && row.role === "publisher" && (
                        <span className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => loginAsPublisher(row.id)}
                            disabled={impersonatingId === row.id}
                            className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                          >
                            Login as publisher
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}
