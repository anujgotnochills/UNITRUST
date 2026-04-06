export default function RegisterAssetPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-3xl font-display font-black text-[#1A1A1A] tracking-tight">Register Asset</h2>
        <p className="text-muted mt-2">Tokenize a new physical or digital asset on-chain.</p>
      </div>
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-8">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1">Asset Name</label>
            <input type="text" className="w-full px-4 py-2 rounded-lg border border-black/10 focus:ring-2 focus:ring-accent-pink/50 outline-none transition-all" placeholder="e.g. Solar Panel 45A" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1">Description</label>
            <textarea className="w-full px-4 py-2 rounded-lg border border-black/10 focus:ring-2 focus:ring-accent-pink/50 outline-none transition-all" placeholder="Asset details..." rows={4} />
          </div>
          <button className="w-full py-3 bg-[#1A1A1A] text-white rounded-full font-semibold hover:bg-black transition-colors">
            Mint Asset
          </button>
        </form>
      </div>
    </div>
  );
}
