export default function NewRequestPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-3xl font-display font-black text-[#1A1A1A] tracking-tight">New Request</h2>
        <p className="text-muted mt-2">Submit a new request for authentication, asset verification, or certification.</p>
      </div>
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-8">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1">Select Institute</label>
            <select className="w-full px-4 py-2 rounded-lg border border-black/10 focus:ring-2 focus:ring-accent-pink/50 outline-none transition-all">
              <span className="text-muted">Choose an Institute...</span>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1">Request Type</label>
            <select className="w-full px-4 py-2 rounded-lg border border-black/10 focus:ring-2 focus:ring-accent-pink/50 outline-none transition-all">
              <span className="text-muted">Choose request type...</span>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1">Additional Details</label>
            <textarea className="w-full px-4 py-2 rounded-lg border border-black/10 focus:ring-2 focus:ring-accent-pink/50 outline-none transition-all" placeholder="Enter details..." rows={4} />
          </div>
          <button className="w-full py-3 bg-[#1A1A1A] text-white rounded-full font-semibold hover:bg-black transition-colors">
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
