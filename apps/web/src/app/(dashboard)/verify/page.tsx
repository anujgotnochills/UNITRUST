export default function VerifyPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-display font-black text-[#1A1A1A] tracking-tight">Verify Record</h2>
        <p className="text-muted mt-2">Enter an Asset ID or Certificate Hash to verify its authenticity on-chain.</p>
      </div>
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-8">
        <div className="flex gap-2">
          <input type="text" className="flex-1 px-4 py-3 rounded-lg border border-black/10 focus:ring-2 focus:ring-accent-pink/50 outline-none transition-all font-mono" placeholder="0x..." />
          <button className="px-6 py-3 bg-[#1A1A1A] text-white rounded-lg font-semibold hover:bg-black transition-colors">
            Verify
          </button>
        </div>
      </div>
    </div>
  );
}
