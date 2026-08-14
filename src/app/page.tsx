import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Agnos</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Patient Real-Time System</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Candidate assignment demo with a responsive patient form and real-time staff monitoring.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Link href="/patient" className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="text-lg font-semibold">Patient Form</div>
            <p className="mt-2 text-sm text-slate-500">Enter and submit patient information.</p>
          </Link>
          <Link href="/staff" className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="text-lg font-semibold">Staff View</div>
            <p className="mt-2 text-sm text-slate-500">Monitor patient information in real time.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}