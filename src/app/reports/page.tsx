export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Reports</h1>
        <p className="text-white/70 mt-1">Choose a range and export occupancy and revenue summaries.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 flex flex-wrap gap-3">
        <input type="date" className="h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white" />
        <input type="date" className="h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white" />
        <select className="h-10 rounded-md border border-white/15 bg-white/5 px-3 text-sm text-white/90">
          <option className="bg-slate-900">Occupancy</option>
          <option className="bg-slate-900">Revenue</option>
          <option className="bg-slate-900">ADR</option>
          <option className="bg-slate-900">RevPAR</option>
        </select>
        <button className="h-10 px-4 rounded-md bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 text-white text-sm">Generate</button>
        <button className="h-10 px-4 rounded-md border border-white/15 bg-white/5 text-white text-sm">Export CSV</button>
        <button className="h-10 px-4 rounded-md border border-white/15 bg-white/5 text-white text-sm">Export PDF</button>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6">
        <p className="text-white/80">Report preview will render here.</p>
      </div>
    </div>
  );
}
