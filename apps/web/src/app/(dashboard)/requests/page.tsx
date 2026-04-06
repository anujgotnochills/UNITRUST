export default function MyRequestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-black text-[#1A1A1A] tracking-tight">My Requests</h2>
          <p className="text-muted mt-2">Track the status of your submitted requests to institutes.</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-12 text-center">
        <p className="text-muted">You have no active requests.</p>
      </div>
    </div>
  );
}
