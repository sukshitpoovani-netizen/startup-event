"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
}

export default function RegisterPage() {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ ticketUrl: string; ticketNumber: string } | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    ticketTypeId: "",
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    designation: "",
    city: "",
  });

  useEffect(() => {
    fetch("/api/ticket-types")
      .then((r) => r.json())
      .then((data) => {
        if (data.ticketTypes) {
          setTicketTypes(data.ticketTypes);
          if (data.ticketTypes.length > 0) {
            setForm((f) => ({ ...f, ticketTypeId: data.ticketTypes[0].id }));
          }
        }
      })
      .catch(() => setError("Failed to load ticket types"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setSuccess({ ticketUrl: data.ticketUrl, ticketNumber: data.ticketNumber });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✓</div>
            <h1 className="text-2xl font-bold text-slate-900">Registration Confirmed</h1>
            <p className="mt-3 text-slate-600">
              Your ticket <strong>{success.ticketNumber}</strong> has been issued. A confirmation email has been sent.
            </p>
            <Link href={success.ticketUrl} className="mt-8 inline-block rounded-lg bg-amber-500 px-6 py-3 font-semibold text-slate-900 hover:bg-amber-400">
              View Your Ticket
            </Link>
            <p className="mt-6 text-sm text-slate-500">
              <Link href="/" className="underline">Return to homepage</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-bold text-slate-900">Startup Expo 2026</Link>
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">← Back</Link>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900">Register</h1>
        <p className="mt-2 text-slate-600">Select your category and complete the form.</p>

        {loading ? (
          <p className="mt-10 text-slate-500">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-slate-700">Ticket Category *</label>
              <select required value={form.ticketTypeId} onChange={(e) => setForm({ ...form, ticketTypeId: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                {ticketTypes.map((tt) => (
                  <option key={tt.id} value={tt.id}>{tt.name} {tt.price > 0 ? `(₹${tt.price})` : "(Free)"}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name *</label>
              <input required type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Mobile Number</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Organization / Startup</label>
              <input type="text" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Designation</label>
                <input type="text" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">City</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full rounded-lg bg-amber-500 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:opacity-60">
              {submitting ? "Submitting..." : "Complete Registration"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
