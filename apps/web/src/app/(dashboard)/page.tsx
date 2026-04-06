export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-black text-[#1A1A1A] tracking-tight">Overview</h2>
          <p className="text-muted mt-2">Welcome to your UniTrust portal.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Assets', value: '0' },
          { label: 'Active Certificates', value: '0' },
          { label: 'Pending Requests', value: '0' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-widest">{stat.label}</h3>
            <p className="text-4xl font-display font-black text-[#1A1A1A] mt-2">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
