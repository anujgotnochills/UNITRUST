export default function MyCertificatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-black text-[#1A1A1A] tracking-tight">My Certificates</h2>
          <p className="text-muted mt-2">View and manage your soulbound credentials and certificates.</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-12 text-center">
        <p className="text-muted">You don't have any certificates yet.</p>
      </div>
    </div>
  );
}
